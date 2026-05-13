import { useEffect, useMemo, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import AuthScreen from "./components/AuthScreen";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import HealthLog from "./pages/HealthLog";
import Log from "./pages/Log";
import Meds from "./pages/Meds";
import Trends from "./pages/Trends";
import { ensureUserProfile, logout, mapAuthError, subscribeAuth } from "./lib/auth";
import { fetchAQI } from "./lib/aqi";
import { db, firebaseApp } from "./lib/firebase";
import { calcRiskScore, detectTriggers, summarizeWeek } from "./lib/insights";
import { addUserLog, subscribeUserLogs } from "./lib/logStore";
import { initialMeds, moods, weeklyLogs } from "./lib/mockData";
import { exportWeeklyReport } from "./lib/report";

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

  function toggleMed(id) {
    setMeds((prev) => prev.map((med) => (med.id === id ? { ...med, taken: !med.taken } : med)));
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
    <div className="mx-auto min-h-screen w-full max-w-md bg-stone-50 px-4 pb-24 pt-4">
      <div className="mb-4 rounded-2xl border border-stone-200 bg-white px-4 py-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">Neburix</p>
            <p className="text-sm text-stone-600">Asthma intelligence and care companion</p>
            <p className="mt-1 text-xs text-stone-500">
              Signed in as {profileName || user.displayName || user.email}
            </p>
          </div>
          <button
            onClick={logout}
            className="rounded-lg border border-stone-300 bg-white px-3 py-1 text-xs font-semibold text-stone-700"
          >
            Sign out
          </button>
        </div>
        {aqiError && <p className="mt-2 text-xs text-amber-700">{aqiError}</p>}
      </div>

      {tab === "dashboard" && (
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
      {tab === "meds" && <Meds meds={meds} onToggle={toggleMed} onAdd={addMedication} onExport={handleExportReport} />}

      <Navbar activeTab={tab} onChange={setTab} />
    </div>
  );
}

export default App;
