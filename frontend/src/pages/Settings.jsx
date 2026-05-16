import { useEffect, useState } from "react";
import Swal from "sweetalert2";

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
        text: "Settings updated successfully.",
        confirmButtonColor: "#0f766e",
      });

      setMessage(result.message);

    } else {

      Swal.fire({
        icon: "error",
        title: "Error",
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
        text: data.message,
        confirmButtonColor: "#0f766e",
      });

    } catch (error) {

      console.error(error);

      Swal.fire({
        icon: "error",
        title: "Error",
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

    <div className="space-y-6 p-4">

      <h2 className="text-xl font-bold text-stone-900">
        Settings
      </h2>

      {/* Caregiver */}
      <div className="rounded-2xl border border-stone-200 bg-white p-4">

        <h3 className="font-semibold text-stone-800">
          Trusted Caregiver
        </h3>

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

      </div>

      {/* Notification Preferences */}
      <div className="rounded-2xl border border-stone-200 bg-white p-4">

        <h3 className="font-semibold text-stone-800">
          Notification Preferences
        </h3>

        <label className="mt-3 flex items-center gap-2">

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
          />

          AQI Alerts

        </label>

        <label className="mt-3 flex items-center gap-2">

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
          />

          Medication Reminders

        </label>

      </div>

      {/* AQI Thresholds */}
      <div className="rounded-2xl border border-stone-200 bg-white p-4 space-y-4">

        <h3 className="font-semibold text-stone-800">
          AQI Thresholds
        </h3>

        <div>

          <label className="text-sm font-medium">
            Mild AQI Threshold
          </label>

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

        </div>

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

      </div>

      {/* Share Report */}
      <div className="rounded-2xl border border-stone-200 bg-white p-4">

        <h3 className="font-semibold text-stone-800">
          Share Doctor Summary
        </h3>

        <input
          type="email"
          placeholder="Enter Email"
          value={doctorEmail}
          onChange={(e) => setDoctorEmail(e.target.value)}
          className="mt-3 w-full rounded-xl border border-stone-300 px-3 py-2"
        />

        <button
          onClick={shareReport}
          className="mt-3 w-full rounded-xl bg-blue-600 px-4 py-2 text-white"
        >
          Share Weekly Report
        </button>

      </div>

      <button
        onClick={saveSettings}
        className="w-full rounded-xl bg-stone-900 px-4 py-3 text-white"
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