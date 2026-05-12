import { useMemo } from "react";
import Card from "../components/Card";
import { moods, quickSymptoms } from "../lib/mockData";

export default function Log({ logs, error, showHeader = true }) {
  const latest = logs[0];
  const moodMap = useMemo(() => Object.fromEntries(moods.map((m) => [m.value, m])), []);

  function formatSymptoms(symptoms) {
    if (!Array.isArray(symptoms) || !symptoms.length) {
      return "None";
    }
    return symptoms.join(", ");
  }

  return (
    <div className="space-y-3">
      {showHeader && (
        <header>
          <h2 className="text-xl font-semibold text-stone-900">Daily log</h2>
          <p className="text-xs text-stone-500">Your latest tracking entry</p>
        </header>
      )}

      {error && (
        <Card title="Sync warning">
          <p className="text-xs text-amber-700">{error}</p>
        </Card>
      )}

      {!latest && <Card title="No logs yet">Start with quick log on Home.</Card>}

      {latest && (
        <Card title="Most recent entry">
          <div className="space-y-2 text-sm text-stone-700">
            <p>
              Mood: {moodMap[latest.mood]?.icon} {moodMap[latest.mood]?.label}
            </p>
            <p>
              Symptoms: {formatSymptoms(latest.symptoms)}
            </p>
            <p>Time: {new Date(latest.createdAt).toLocaleString()}</p>
          </div>
        </Card>
      )}

      {logs.length > 0 && (
        <Card title="Log history">
          <div className="space-y-2">
            {logs.map((entry) => {
              const mood = moodMap[entry.mood];
              return (
                <div key={entry.id || entry.createdAt} className="rounded-xl border border-stone-200 bg-stone-50 p-3">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold text-stone-900">
                      {mood?.icon || "🙂"} {mood?.label || "Logged"}
                    </p>
                    <p className="text-[11px] text-stone-500">{new Date(entry.createdAt).toLocaleString()}</p>
                  </div>
                  <p className="mt-1 text-xs text-stone-600">Symptoms: {formatSymptoms(entry.symptoms)}</p>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      <Card title="Symptom checklist">
        <div className="grid grid-cols-2 gap-2">
          {quickSymptoms.map((symptom) => (
            <div key={symptom.id} className="rounded-xl border border-stone-200 bg-stone-50 p-3 text-sm">
              {symptom.icon} {symptom.label}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
