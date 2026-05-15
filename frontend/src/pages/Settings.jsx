import { useEffect, useState } from "react";

function Settings({ user }) {
  const [caregiverName, setCaregiverName] = useState("");
  const [caregiverEmail, setCaregiverEmail] = useState("");

  const [aqiAlerts, setAqiAlerts] = useState(true);
  const [medAlerts, setMedAlerts] = useState(true);

  const [message, setMessage] = useState("");




  useEffect(() => {
  async function loadSettings() {
    try {
      const response = await fetch(
        `http://127.0.0.1:5000/api/settings/${user.uid}`
      );

      const data = await response.json();

      if (data.status === "success") {
        const settings = data.settings;

        setCaregiverName(settings.caregiverName || "");
        setCaregiverEmail(settings.caregiverEmail || "");

        setAqiAlerts(
          settings.preferences?.aqiAlerts ?? true
        );

        setMedAlerts(
          settings.preferences?.medAlerts ?? true
        );
      }

    } catch (error) {
      console.error("Failed to load settings:", error);
    }
  }

  if (user?.uid) {
    loadSettings();
  }
}, [user]);


  const [doctorEmail, setDoctorEmail] = useState("");

  async function saveSettings() {
    try {
      const response = await fetch("http://127.0.0.1:5000/api/settings/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          uid: user.uid,
          caregiverName,
          caregiverEmail,
          preferences: {
            aqiAlerts,
            medAlerts,
          },
        }),
      });

      const data = await response.json();

      setMessage(data.message || "Settings saved.");

    } catch (error) {
      console.error(error);
      setMessage("Failed to save settings.");
    }
  }


  async function shareReport() {
  try {
    const response = await fetch("http://127.0.0.1:5000/api/report/share", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        uid: user.uid,
        recipientEmail: doctorEmail,
        weekLabel: "Last 7 days",
      }),
    });

    const data = await response.json();

    setMessage(data.message || "Report shared.");

  } catch (error) {
    console.error(error);
    setMessage("Failed to share report.");
  }
}

  return (
    <div className="space-y-4 px-4 py-4">
      <h2 className="text-xl font-bold text-stone-900">
        Settings & Caregiver
      </h2>

      <div className="rounded-2xl border border-stone-200 bg-white p-4">
        <h3 className="font-semibold text-stone-800">
          Trusted Caregiver
        </h3>

        <input
          type="text"
          placeholder="Caregiver Name"
          value={caregiverName}
          onChange={(e) => setCaregiverName(e.target.value)}
          className="mt-3 w-full rounded-xl border border-stone-300 px-3 py-2"
        />

        <input
          type="email"
          placeholder="Caregiver Email"
          value={caregiverEmail}
          onChange={(e) => setCaregiverEmail(e.target.value)}
          className="mt-3 w-full rounded-xl border border-stone-300 px-3 py-2"
        />
      </div>

      <div className="rounded-2xl border border-stone-200 bg-white p-4">
        <h3 className="font-semibold text-stone-800">
          Notification Preferences
        </h3>

        <label className="mt-3 flex items-center gap-2">
          <input
            type="checkbox"
            checked={aqiAlerts}
            onChange={() => setAqiAlerts(!aqiAlerts)}
          />

          AQI Alerts
        </label>

        <label className="mt-3 flex items-center gap-2">
          <input
            type="checkbox"
            checked={medAlerts}
            onChange={() => setMedAlerts(!medAlerts)}
          />

          Medication Reminders
        </label>
      </div>




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