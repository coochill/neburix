// src/pages/Settings.jsx
import { useEffect, useState } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../lib/firebase";

export default function Settings({ user }) {
  const [threshold, setThreshold] = useState(100);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!user?.uid) return;

      const ref = doc(db, "users", user.uid);
      const snap = await getDoc(ref);

      const data = snap.data();
      if (data?.aqiThreshold) {
        setThreshold(data.aqiThreshold);
      }

      setLoading(false);
    }

    load();
  }, [user]);

  async function save() {
    if (!user?.uid) return;

    await setDoc(
      doc(db, "users", user.uid),
      {
        aqiThreshold: threshold,
      },
      { merge: true }
    );

    alert("Settings saved");
  }

  if (loading) return <p className="p-4">Loading settings...</p>;

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-lg font-bold">Settings</h1>

      <div className="space-y-2">
        <label className="text-sm font-medium">
          AQI Alert Threshold
        </label>

        <input
          type="number"
          value={threshold}
          onChange={(e) => setThreshold(Number(e.target.value))}
          className="w-full border p-2 rounded"
        />

        <p className="text-xs text-gray-500">
          You will get notified when AQI goes above this value.
        </p>
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