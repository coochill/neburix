import { useEffect, useState } from "react";
import Swal from "sweetalert2";

export default function Settings({ user }) {

  const [settings, setSettings] = useState({
    aqi_mild: 51,
    aqi_moderate: 101,
    aqi_severe: 151,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {

    async function load() {

      if (!user?.uid) return;

      const response = await fetch(
        `http://localhost:5000/api/settings/${user.uid}`
      );

      const result = await response.json();

      if (result?.data) {

        setSettings((prev) => ({
          ...prev,
          ...result.data,
        }));

      }

      setLoading(false);

    }

    load();

  }, [user]);

  function showError(message) {

    Swal.fire({
      icon: "warning",
      title: "Invalid Threshold",
      text: message,
      confirmButtonColor: "#0f766e",
    });

  }

  function updateField(key, value) {

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

  async function save() {

    if (!user?.uid) return;

    await fetch(
      `http://localhost:5000/api/settings/${user.uid}`,
      {
        method: "PATCH",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify(settings),
      }
    );

    Swal.fire({
      icon: "success",
      title: "Saved",
      text: "AQI settings updated successfully.",
      confirmButtonColor: "#0f766e",
    });

  }

  if (loading) {
    return (
      <p className="p-4">
        Loading settings...
      </p>
    );
  }

  return (
    <div className="p-4 space-y-6">

      <h1 className="text-lg font-bold">
        AQI Settings
      </h1>

      <div className="space-y-2">

        <label className="text-sm font-medium">
          Mild AQI Threshold
        </label>

        <input
          type="number"
          value={settings.aqi_mild}
          onChange={(e) =>
            updateField(
              "aqi_mild",
              e.target.value
            )
          }
          className="w-full border p-2 rounded"
        />

      </div>

      <div className="space-y-2">

        <label className="text-sm font-medium">
          Moderate AQI Threshold
        </label>

        <input
          type="number"
          value={settings.aqi_moderate}
          onChange={(e) =>
            updateField(
              "aqi_moderate",
              e.target.value
            )
          }
          className="w-full border p-2 rounded"
        />

      </div>

      <div className="space-y-2">

        <label className="text-sm font-medium">
          Severe AQI Threshold
        </label>

        <input
          type="number"
          value={settings.aqi_severe}
          onChange={(e) =>
            updateField(
              "aqi_severe",
              e.target.value
            )
          }
          className="w-full border p-2 rounded"
        />

      </div>

      <button
        onClick={save}
        className="bg-teal-600 text-white px-4 py-2 rounded"
      >
        Save
      </button>

    </div>
  );
}