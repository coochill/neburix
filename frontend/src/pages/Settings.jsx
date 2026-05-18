import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { Settings as SettingsIcon, UserCheck, Bell,Gauge, FileText} from "lucide-react";

function Settings({ user }) {

  const [loading, setLoading] = useState(true);

  const [message, setMessage] = useState("");

  const [doctorEmail, setDoctorEmail] = useState("");

  const [settings, setSettings] = useState({
    caregiverName: "",
    caregiverEmail: "",

    preferences: {
      aqiAlerts: true,
      medAlerts: true,
    },

    aqi_mild: 51,
    aqi_moderate: 101,
    aqi_severe: 151,
  });

  useEffect(() => {

    async function loadSettings() {

      try {

        if (!user?.uid) {

          return;

        }

        const response = await fetch(
          `http://127.0.0.1:5000/api/settings/${user.uid}`
        );

        const result = await response.json();

        if (result.success) {

          const data = result.data;

          setSettings((prev) => {

            const merged = {
              ...prev,
              ...data,

              preferences: {
                ...prev.preferences,
                ...(data.preferences || {}),
              },
            };

            return merged;

          });

        } else {

        }

      } catch (error) {

        console.error(
          "SETTINGS: Failed to load settings:",
          error
        );

      } finally {

        setLoading(false);

      }

    }

    loadSettings();

  }, [user]);

  function showError(message) {

    Swal.fire({
      icon: "warning",
      title: "Invalid Threshold",
      text: message,
      width: 320,
      confirmButtonColor: "#0f766e",
    });

  }

  function updateThreshold(key, value) {

    const number = Number(value);

    setSettings((prev) => {

      const updated = {
        ...prev,
      };

      // Mild
      if (key === "aqi_mild") {

        if (number >= prev.aqi_moderate) {

          showError(
            "Mild threshold must be lower than Moderate threshold."
          );

          return prev;

        }

        updated.aqi_mild = number;

      }

      // Moderate
      if (key === "aqi_moderate") {

        if (number <= prev.aqi_mild) {

          showError(
            "Moderate threshold must be higher than Mild threshold."
          );

          return prev;

        }

        if (number >= prev.aqi_severe) {

          showError(
            "Moderate threshold must be lower than Severe threshold."
          );

          return prev;

        }

        updated.aqi_moderate = number;

      }

      // Severe
      if (key === "aqi_severe") {

        if (number <= prev.aqi_moderate) {

          showError(
            "Severe threshold must be higher than Moderate threshold."
          );

          return prev;

        }

        updated.aqi_severe = number;

      }

      return updated;

    });

  }

  async function saveSettings() {

    try {

      const response = await fetch(
        `http://127.0.0.1:5000/api/settings/${user.uid}`,
        {
          method: "PATCH",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify(settings),
        }
      );

      const result = await response.json();

      if (result.success) {

        Swal.fire({
          icon: "success",
          title: "Saved",
          width: 320,
          text: "Settings updated successfully.",
          confirmButtonColor: "#0f766e",
        });

        setMessage(result.message);

      } else {

        Swal.fire({
          icon: "error",
          title: "Error",
          width: 320,
          text: result.message || "Failed to save settings.",
        });

      }

    } catch (error) {

      console.error(
        "SETTINGS: Save crashed:",
        error
      );

      Swal.fire({
        icon: "error",
        title: "Error",
        width: 320,
        text: "Failed to save settings.",
      });

    }

  }

  async function shareReport() {

    try {

      const response = await fetch(
        "http://127.0.0.1:5000/api/report/share",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            uid: user.uid,
            recipientEmail: doctorEmail,
            weekLabel: "Last 7 days",
          }),
        }
      );

      const data = await response.json();

      setMessage(data.message || "Report shared.");

      Swal.fire({
        icon: "success",
        title: "Report Shared",
        width: 320,
        text: data.message,
        confirmButtonColor: "#0f766e",
      });

    } catch (error) {

      console.error(error);

      Swal.fire({
        icon: "error",
        title: "Error",
        width: 320,
        text: "Failed to share report.",
      });

    }

  }

  if (loading) {

    return (
      <p className="p-4">
        Loading settings...
      </p>
    );

  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <header
        className="relative overflow-hidden rounded-2xl p-4 text-white shadow-md"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.62 0.11 220), oklch(0.56 0.09 200))",
        }}
      >
        <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-white/10 blur-2xl" />

        <div className="relative flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.18em] text-white/70">
              System Preferences
            </p>

            <h2 className="mt-1 text-2xl font-semibold tracking-tight">
              Settings
            </h2>

            <p className="mt-1 text-xs text-white/80">
              Manage alerts and AQI thresholds
            </p>
          </div>

          {/* icon */}
          <div className="rounded-xl bg-white/15 p-2.5 backdrop-blur">
            <SettingsIcon className="h-5 w-5 text-white" />
          </div>
        </div>
      </header>

      {/* Caregiver */}
      <section
        className="rounded-2xl border p-4 space-y-3"
        style={{
          borderColor: "oklch(0.85 0.03 220)",
          backgroundColor: "oklch(0.98 0.01 220)",
        }}
      >

        {/* Header */}
<div className="flex items-start gap-0">

  {/* Icon */}
  <div className="flex items-center justify-center w-8 h-8">
    <UserCheck
      className="h-5 w-5"
      style={{ color: "oklch(0.56 0.09 200)" }}
    />
  </div>



          {/* Text */}
          <div>
            <p
              className="text-base font-semibold"
              style={{ color: "oklch(0.56 0.09 200)" }}
            >
              Trusted Caregiver
            </p>

            <p className="text-[11px] text-stone-500">
              Person who receives alerts and reports
            </p>
          </div>

        </div>

        <input
          type="text"
          placeholder="Caregiver Name"
          value={settings.caregiverName}
          onChange={(e) =>
            setSettings({
              ...settings,
              caregiverName: e.target.value,
            })
          }
          className="mt-3 w-full rounded-xl border border-stone-300 px-3 py-2"
        />

        <input
          type="email"
          placeholder="Caregiver Email"
          value={settings.caregiverEmail}
          onChange={(e) =>
            setSettings({
              ...settings,
              caregiverEmail: e.target.value,
            })
          }
          className="mt-3 w-full rounded-xl border border-stone-300 px-3 py-2"
        />

      </section>

      {/* Notification Preferences */}
      <section
        className="rounded-2xl border p-4 space-y-3"
        style={{
          borderColor: "oklch(0.85 0.03 220)",
          backgroundColor: "oklch(0.98 0.01 220)",
        }}
      >
 <div className="flex items-start gap-0">

  {/* Icon */}
  <div className="flex items-center justify-center w-8 h-8">
            <Bell
              className="h-5 w-5"
              style={{ color: "oklch(0.56 0.09 200)" }}
            />
          </div>

          {/* Text */}
          <div>
          <p className="text-base font-semibold" style={{ color: "oklch(0.56 0.09 200)" }}>
            Notifications
          </p>
          <p className="text-[11px] text-stone-500">
            Control alerts and reminders
          </p>
        </div>
        </div>
        <label className="mt-3 flex items-center gap-2 cursor-pointer">

          <input
            type="checkbox"
            checked={settings.preferences.aqiAlerts}
            onChange={() =>
              setSettings({
                ...settings,
                preferences: {
                  ...settings.preferences,
                  aqiAlerts: !settings.preferences.aqiAlerts,
                },
              })
            }
             className="h-4 w-4 accent-blue-600 transition-all duration-200 hover:scale-110 hover:shadow-md"
          />

          AQI Alerts

        </label>

        <label className="mt-3 flex items-center gap-2 cursor-pointer">

          <input
            type="checkbox"
            checked={settings.preferences.medAlerts}
            onChange={() =>
              setSettings({
                ...settings,
                preferences: {
                  ...settings.preferences,
                  medAlerts: !settings.preferences.medAlerts,
                },
              })
            }
             className="h-4 w-4 accent-blue-600 transition-all duration-200 hover:scale-110 hover:shadow-md"
          />

          Medication Reminders

        </label>

      </section>

      {/* AQI Thresholds */}
      <section
        className="rounded-2xl border p-4 space-y-4"
        style={{
          borderColor: "oklch(0.85 0.03 220)",
          backgroundColor: "oklch(0.98 0.01 220)",
        }}
      >
<div className="flex items-start gap-0">

  {/* Icon */}
  <div className="flex items-center justify-center w-8 h-8">
            <Gauge
              className="h-5 w-5"
              style={{ color: "oklch(0.56 0.09 200)" }}
            />
          </div>

          {/* Text */}
          <div>
          <p className="text-base font-semibold" style={{ color: "oklch(0.56 0.09 200)" }}>
            AQI Thresholds
          </p>
          <p className="text-[11px] text-stone-500">
            Set air quality alert sensitivity levels
          </p>
</div>
</div>
          <input
            type="number"
            value={settings.aqi_mild}
            onChange={(e) =>
              updateThreshold(
                "aqi_mild",
                e.target.value
              )
            }
            className="mt-1 w-full rounded-xl border border-stone-300 px-3 py-2"
          />

       

        <div>

          <label className="text-sm font-medium">
            Moderate AQI Threshold
          </label>

          <input
            type="number"
            value={settings.aqi_moderate}
            onChange={(e) =>
              updateThreshold(
                "aqi_moderate",
                e.target.value
              )
            }
            className="mt-1 w-full rounded-xl border border-stone-300 px-3 py-2"
          />

        </div>

        <div>

          <label className="text-sm font-medium">
            Severe AQI Threshold
          </label>

          <input
            type="number"
            value={settings.aqi_severe}
            onChange={(e) =>
              updateThreshold(
                "aqi_severe",
                e.target.value
              )
            }
            className="mt-1 w-full rounded-xl border border-stone-300 px-3 py-2"
          />

        </div>

      </section>

      {/* Share Report */}
      <section
        className="rounded-2xl border p-4 space-y-3"
        style={{
          borderColor: "oklch(0.85 0.03 220)",
          backgroundColor: "oklch(0.98 0.01 220)",
        }}
      >
        {/* Header */}
<div className="flex items-start gap-0">

  {/* Icon */}
  <div className="flex items-center justify-center w-8 h-8">
    <FileText
      className="h-5 w-5"
      style={{ color: "oklch(0.56 0.09 200)" }}
    />
  </div>



          {/* Text */}
          <div>
          <p className="text-base font-semibold" style={{ color: "oklch(0.56 0.09 200)" }}>
            Share Report
          </p>
          <p className="text-[11px] text-stone-500">
            Send weekly health summary to doctor
          </p>
</div>
</div>
          <input
            type="email"
            placeholder="Enter Email"
            value={doctorEmail}
            onChange={(e) => setDoctorEmail(e.target.value)}
            className="mt-3 w-full rounded-xl border border-stone-300 px-3 py-2"
          />

 <button
  onClick={shareReport}
  className="mt-3 w-full rounded-xl bg-blue-600 px-4 py-2 text-white shadow-md transition-all duration-300 hover:shadow-xl hover:bg-blue-700 hover:scale-[1.02] active:scale-[0.98]"
>
  Share Weekly Report
</button>
      </section>

      <button
  onClick={saveSettings}
  className="mt-5 w-[95%] block mx-auto rounded-2xl py-3 text-sm font-semibold text-white shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
  style={{
    background:
      "linear-gradient(135deg, oklch(0.62 0.11 220), oklch(0.56 0.09 200))",
  }}
>
  Save Settings
</button>

      {message && (
        <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {message}
        </div>
      )}

    </div>

  );

}

export default Settings;