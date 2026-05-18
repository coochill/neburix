import { useEffect, useMemo, useState, useRef } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import AuthScreen from "./components/AuthScreen";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import HealthLog from "./pages/HealthLog";
import Log from "./pages/Log";
import Meds from "./pages/Meds";
import Trends from "./pages/Trends";
import AttackGuidance from "./components/AttackGuidance";
import Settings from "./pages/Settings";
import { ensureUserProfile, logout, mapAuthError, subscribeAuth } from "./lib/auth";
import { fetchAQI } from "./lib/aqi";
import { db, firebaseApp } from "./lib/firebase";
import { calcRiskScore, detectTriggers, summarizeWeek } from "./lib/insights";
import { addUserLog, subscribeUserLogs } from "./lib/logStore";
import { initialMeds, moods, weeklyLogs } from "./lib/mockData";
import { exportWeeklyReport } from "./lib/report";
import logo from "./assets/logo.png"
import { onMessage } from "firebase/messaging";
import { messaging } from "./lib/firebase";

function App() {
  const [tab, setTab] = useState("dashboard");
  const [city, setCity] = useState("Manila");
  const [aqi, setAqi] = useState(82);
  const [aqiLoading, setAqiLoading] = useState(false);
  const [aqiError, setAqiError] = useState("");
  const [quickMood, setQuickMood] = useState(null);
  const [quickSymptoms, setQuickSymptoms] = useState([]);
  const [logs, setLogs] = useState([]);
  const [meds, setMeds] = useState(initialMeds);
  const [user, setUser] = useState(null);
  const [profileName, setProfileName] = useState("");
  const [authLoading, setAuthLoading] = useState(true);
  const [authInitError, setAuthInitError] = useState("");
  const [logSyncError, setLogSyncError] = useState("");
  const [medAlert, setMedAlert] = useState("");
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);
  const closeDropdown = () => setOpen(false);

  // Keep Firebase initialized and tree-shaken as part of app startup.
  void firebaseApp;

  useEffect(() => {
    const unsub = subscribeAuth((nextUser) => {
      setUser(nextUser);
      setAuthLoading(false);
      setAuthInitError("");

      if (nextUser?.uid) {
        ensureUserProfile(nextUser).catch(() => {
          setAuthInitError("Signed in, but profile sync to Firestore failed.");
        });
      }
    }, (error) => {
      setAuthInitError(mapAuthError(error));
      setAuthLoading(false);
    });

    return () => unsub();
  }, []);

  useEffect(() => {
    if (!user?.uid) {
      setLogs([]);
      setLogSyncError("");
      return;
    }

    const unsubLogs = subscribeUserLogs(
      user.uid,
      (nextLogs) => {
        setLogs(nextLogs);
        setLogSyncError("");
      },
      () => {
        setLogSyncError("Firestore sync failed. Check Firestore enablement and rules.");
      },
    );

    return () => unsubLogs();
  }, [user?.uid]);

  useEffect(() => {
    if (!user?.uid) {
      setProfileName("");
      return;
    }

    const profileRef = doc(db, "users", user.uid);
    const unsubProfile = onSnapshot(
      profileRef,
      (snapshot) => {
        const username = snapshot.data()?.username;
        if (typeof username === "string" && username.trim()) {
          setProfileName(username.trim());
          return;
        }
        setProfileName(user.displayName || user.email?.split("@")[0] || "Neburix User");
      },
      () => {
        setProfileName(user.displayName || user.email?.split("@")[0] || "Neburix User");
      },
    );

    return () => unsubProfile();
  }, [user?.uid, user?.displayName, user?.email]);

  useEffect(() => {
    let active = true;

    async function loadAQI() {
      setAqiLoading(true);
      setAqiError("");
      try {
        const data = await fetchAQI(city);
        if (active) {
          setAqi(Number(data.aqi) || 0);
        }
      } catch (error) {
        if (active) {
          setAqiError(error?.message || "AQI fetch failed");
        }
      } finally {
        if (active) {
          setAqiLoading(false);
        }
      }
    }

    loadAQI();
    return () => {
      active = false;
    };
  }, [city]);

  const triggerInsight = useMemo(() => detectTriggers(weeklyLogs), []);

  const homeStats = useMemo(() => {
    const latest = logs[0] || null;
    const moodByValue = Object.fromEntries(moods.map((m) => [m.value, m]));
    const moodMeta = latest ? moodByValue[latest.mood] : null;

    const symptomCounts = {};
    (logs || []).forEach((entry) => {
      (entry.symptoms || []).forEach((symptom) => {
        symptomCounts[symptom] = (symptomCounts[symptom] || 0) + 1;
      });
    });

    const topSymptomEntry = Object.entries(symptomCounts).sort((a, b) => b[1] - a[1])[0] || ["none", 0];
    const topSymptom = topSymptomEntry[0] === "none" ? "None" : topSymptomEntry[0];
    const topSymptomCount = topSymptomEntry[1] || 0;

    const avgSymptomSeverity = logs.length
      ? logs.reduce((sum, entry) => sum + ((entry.symptoms || []).length / 4), 0) / logs.length
      : 0.35;

    return {
      latestMoodIcon: moodMeta?.icon || "🙂",
      latestMoodLabel: moodMeta?.label || "No logs",
      latestSymptomCount: (latest?.symptoms || []).length,
      topSymptom,
      topSymptomCount,
      avgSymptomSeverity,
      hasLogs: logs.length > 0,
    };
  }, [logs]);

  const medTakenPct = useMemo(() => {
    if (!meds.length) return 0;
    return (meds.filter((m) => m.taken).length / meds.length) * 100;
  }, [meds]);

  const risk = useMemo(() => {
    const triggerExposure = homeStats.hasLogs
      ? Math.min(homeStats.topSymptomCount / Math.max(logs.length, 1), 1)
      : Math.min(triggerInsight.count / 7, 1);
    const missedMedication = 1 - medTakenPct / 100;

    return calcRiskScore({
      symptomSeverity: homeStats.avgSymptomSeverity,
      aqi,
      triggerExposure,
      missedMedication,
    });
  }, [aqi, homeStats.avgSymptomSeverity, homeStats.hasLogs, homeStats.topSymptomCount, logs.length, medTakenPct, triggerInsight.count]);

  function handleQuickSymptomToggle(id) {
    setQuickSymptoms((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  async function handleQuickSubmit() {
    if (!quickMood && !quickSymptoms.length) return;

    if (!user?.uid) {
      setLogSyncError("Please sign in before saving logs.");
      return;
    }

    const payload = {
      mood: quickMood || 3,
      symptoms: quickSymptoms,
      aqiSnapshot: aqi,
      city,
      createdAt: new Date().toISOString(),
    };

    try {
      await addUserLog(user.uid, payload);
    } catch {
      setLogSyncError("Could not save to Firestore. Verify Firestore setup and security rules.");
    }

    setQuickMood(null);
    setQuickSymptoms([]);
    setTab("health-log");
  }

  async function toggleMed(id) {
    let updatedMedication = null;

    const updatedMeds = meds.map((med) => {
      if (med.id === id) {
        updatedMedication = {
          ...med,
          taken: !med.taken,
        };

        return updatedMedication;
      }

      return med;
    });

    setMeds(updatedMeds);

    // Send adherence check to backend
    try {
      const response = await fetch("http://127.0.0.1:5000/api/meds/check", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          uid: user.uid,
          name: updatedMedication.name,
          time: updatedMedication.time,
          taken: updatedMedication.taken,
        }),
      });

      const data = await response.json();

      setMedAlert(data.message || "");

    } catch (error) {
      console.error("Medication adherence check failed:", error);
    }
  }

  function addMedication(payload) {
    setMeds((prev) => {
      const nextId = prev.length ? Math.max(...prev.map((med) => Number(med.id) || 0)) + 1 : 1;
      return [
        ...prev,
        {
          id: nextId,
          name: payload.name,
          dose: payload.dose,
          time: payload.time,
          type: payload.type,
          taken: false,
        },
      ];
    });
  }

  function handleExportReport() {
    const reportLogs = logs.length ? logs : weeklyLogs;
    const summary = summarizeWeek(reportLogs, medTakenPct, aqi);
    exportWeeklyReport({
      patientName: profileName || user.displayName || user.email?.split("@")[0] || "Neburix User",
      weekLabel: deriveWeekLabel(reportLogs),
      summary,
    });
  }

  function deriveWeekLabel(reportLogs) {
    if (!Array.isArray(reportLogs) || !reportLogs.length) {
      return "Last 7 days";
    }

    const dated = reportLogs
      .map((log) => new Date(log.createdAt))
      .filter((date) => !Number.isNaN(date.getTime()))
      .sort((a, b) => a - b);

    if (!dated.length) {
      return "Last 7 days";
    }

    const format = (date) => date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
    return `${format(dated[0])} - ${format(dated[dated.length - 1])}`;
  }

  if (authLoading) {
    return (
      <div className="mx-auto flex min-h-screen w-full max-w-md items-center justify-center px-4">
        <p className="text-sm text-stone-600">Checking session...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <>
        {authInitError && (
          <div className="mx-auto mt-4 w-full max-w-md rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800">
            Firebase init warning: {authInitError}
          </div>
        )}
        <AuthScreen />
      </>
    );
  }

  

  return (
 <div className="mx-auto min-h-screen w-full max-w-md bg-stone-50 pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-stone-200 bg-white/95 backdrop-blur">
        <div className="flex items-center justify-between px-4 py-4">

          {/* LEFT: Logo + Text */}
          <div className="flex items-center gap-3">
            <img
              src={logo}
              alt="NEBURIX Logo"
              className="h-12 w-12 object-contain"
            />

            <div className="flex flex-col">
              <h1 className="text-lg font-bold tracking-tight text-stone-900">
                NEBURIX
              </h1>

              <p className="text-xs text-stone-500">
                Asthma intelligence and care companion
              </p>
            </div>
          </div>

          {/* RIGHT: Profile Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
  onClick={() => setOpen((prev) => !prev)}
  className="
    flex h-10 w-10 items-center justify-center overflow-hidden
    rounded-full border border-blue-300
    bg-blue-100
    transition-all duration-200
    hover:bg-blue-200 hover:shadow-md hover:shadow-blue-300/40
  "
>
  {user.photoURL ? (
    <img
      src={user.photoURL}
      alt="avatar"
      className="h-full w-full object-cover"
    />
  ) : (
    <span className="text-sm font-semibold text-blue-700">
      {(profileName || user.displayName || user.email || "U")
        .charAt(0)
        .toUpperCase()}
    </span>
  )}
</button>
            {/* Dropdown */}
            {open && (
              <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-stone-200 bg-white p-2 shadow-xl">
                <div className="border-b border-stone-100 px-2 pb-2">
                  <p className="text-sm font-medium text-stone-900">
                    {profileName || user.displayName || "User"}
                  </p>

                  <p className="text-xs text-stone-500">
                    Signed in as {user.email}
                  </p>
                </div>

                <button
                    onClick={() => {
                    setTab("settings");
                  closeDropdown();
                }}
                                className="mt-2 w-full rounded-lg px-3 py-2 text-left text-sm text-stone-700 hover:bg-blue-200 hover:shadow-md hover:shadow-blue-300/40"
                              >
                                Settings
                              </button>

                <button
  onClick={closeDropdown}
  className="w-full rounded-lg px-3 py-2 text-left text-sm text-stone-700 hover:bg-blue-200 hover:shadow-md hover:shadow-blue-300/40"
>
  Profile
</button>

                <div className="my-2 border-t border-stone-100" />

               <button
  onClick={() => {
    logout();
    closeDropdown();
  }}
  className="w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-red-600 hover:bg-blue-200 hover:shadow-md hover:shadow-blue-300/40"
>
  Sign out
</button>
              </div>
            )}
          </div>
        </div>

        {aqiError && (
          <p className="border-t border-stone-100 px-4 py-2 text-xs text-amber-700">
            {aqiError}
          </p>
        )}
      </header>

      {/* Your content here */}
      <div className="px-4 pt-4">
        {/* Dashboard content */}
      </div>
    
    {tab === "dashboard" && (
      <>
        <Dashboard
          displayName={profileName || user.displayName || user.email?.split("@")[0] || "Neburix User"}
          city={city}
          aqi={aqi}
          risk={risk}
          homeStats={homeStats}
          triggerInsight={triggerInsight}
          quickMood={quickMood}
          quickSymptoms={quickSymptoms}
          onQuickMood={setQuickMood}
          onQuickSymptom={handleQuickSymptomToggle}
          onQuickSubmit={handleQuickSubmit}
        />

        <AttackGuidance user={user} />
      </>
    )}
      {tab === "health-log" && (
        <HealthLog
          logs={logs}
          logError={logSyncError}
        />
      )}
      {tab === "trends" && (
        <Trends
          logs={logs}
          triggerInsight={triggerInsight}
          city={city}
          aqi={aqi}
          loading={aqiLoading}
          error={aqiError}
          onCity={setCity}
        />
      )}
      {tab === "meds" && (
        <>
          {medAlert && (
            <div className="mx-4 mb-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              {medAlert}
            </div>
          )}

          <Meds
            meds={meds}
            userId={user.uid}
            onToggle={toggleMed}
            onAdd={addMedication}
            onExport={handleExportReport}
          />
        </>
      )}

      {tab === "settings" && <Settings user={user} />}
      <Navbar activeTab={tab} onChange={setTab} />
    </div>
  );
}

export default App;
