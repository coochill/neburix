import { useMemo } from "react";
import {
  HeartPulse,
  Clock3,
  Wind,
  Activity,
  Moon,
  CloudFog,
  AlertCircle,
  Sparkles,
} from "lucide-react";

import Card from "../components/Card";
import { moods, quickSymptoms } from "../lib/mockData";

export default function Log({ logs, error, showHeader = true }) {
  const latest = logs[0];

  const moodMap = useMemo(
    () => Object.fromEntries(moods.map((m) => [m.value, m])),
    []
  );

  function formatSymptoms(symptoms) {
    if (!Array.isArray(symptoms) || !symptoms.length) {
      return "None";
    }

    return symptoms.join(", ");
  }

  function getSymptomIcon(label) {
    const text = label.toLowerCase();

    if (text.includes("cough")) {
      return <Wind className="h-4 w-4" />;
    }

    if (text.includes("tight")) {
      return <Activity className="h-4 w-4" />;
    }

    if (text.includes("sleep")) {
      return <Moon className="h-4 w-4" />;
    }

    if (text.includes("wheez")) {
      return <CloudFog className="h-4 w-4" />;
    }

    return <AlertCircle className="h-4 w-4" />;
  }

  return (
<div className="space-y-3">
  {showHeader && (
    <header className="space-y-1">
      <h2
        className="text-xl font-semibold tracking-tight"
        style={{ color: "oklch(0.56 0.09 200)" }}
      >
        Daily Log
      </h2>

      <p className="text-xs text-stone-500">
        Monitor your asthma symptoms and wellness
      </p>
    </header>
  )}

  {error && (
    <div className="rounded-2xl border border-amber-200 bg-amber-50 px-3 py-2 shadow-sm">
      <p className="text-xs text-amber-700">{error}</p>
    </div>
  )}

  {!latest && (
    <div
      className="rounded-2xl border bg-white p-4 shadow-sm"
      style={{ borderColor: "oklch(0.9 0.02 220)" }}
    >
      <div className="flex flex-col items-center justify-center text-center">
        <div
          className="mb-2 flex h-11 w-11 items-center justify-center rounded-xl text-white shadow-sm"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.62 0.11 220), oklch(0.56 0.09 200))",
          }}
        >
          <Sparkles className="h-5 w-5" />
        </div>

        <h3 className="text-base font-semibold text-stone-900">
          No logs yet
        </h3>

        <p className="mt-1 text-xs text-stone-500">
          Start tracking your symptoms from the Home tab
        </p>
      </div>
    </div>
  )}

  {latest && (
    <div
      className="overflow-hidden rounded-2xl p-4 text-white shadow-md"
      style={{
        background:
          "linear-gradient(135deg, oklch(0.62 0.11 220), oklch(0.56 0.09 200))",
      }}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-wide text-white/70">
            Recent Entry
          </p>

          <h3 className="mt-1 text-xl font-semibold">
            {moodMap[latest.mood]?.label || "Feeling okay"}
          </h3>
        </div>

        <div className="rounded-xl bg-white/15 p-2.5 backdrop-blur">
          <HeartPulse className="h-5 w-5" />
        </div>
      </div>

      <div className="mt-4 space-y-2">
        <div className="rounded-xl bg-white/10 p-2.5 backdrop-blur">
          <p className="text-[10px] text-white/70">Mood</p>
          <p className="text-xs font-medium flex items-center gap-1">
            <i className={`ti ${moodMap[latest.mood]?.icon}`} aria-hidden="true" />
            {moodMap[latest.mood]?.label}
          </p>
        </div>

        <div className="rounded-xl bg-white/10 p-2.5 backdrop-blur">
          <p className="text-[10px] text-white/70">Symptoms</p>
          <p className="text-xs">{formatSymptoms(latest.symptoms)}</p>
        </div>

        <div className="flex items-center gap-2 text-[10px] text-white/70">
          <Clock3 className="h-3.5 w-3.5" />
          <span>{new Date(latest.createdAt).toLocaleString()}</span>
        </div>
      </div>
    </div>
  )}

  {logs.length > 0 && (
    <div
      className="rounded-2xl border bg-white p-3 shadow-sm"
      style={{ borderColor: "oklch(0.9 0.02 220)" }}
    >
      <div className="mb-3">
        <h3
          className="text-base font-semibold"
          style={{ color: "oklch(0.56 0.09 200)" }}
        >
          Log History
        </h3>
        <p className="text-[11px] text-stone-500">
          Recent asthma tracking activity
        </p>
      </div>

      <div className="space-y-2">
        {logs.map((entry) => {
          const mood = moodMap[entry.mood];

          return (
            <div
              key={entry.id || entry.createdAt}
              className="rounded-xl border p-3 hover:shadow-sm transition"
              style={{
                borderColor: "oklch(0.92 0.02 220)",
                backgroundColor: "oklch(0.98 0.01 220)",
              }}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-white"
                    style={{
                      background:
                        "linear-gradient(135deg, oklch(0.62 0.11 220), oklch(0.56 0.09 200))",
                    }}
                  >
                    <HeartPulse className="h-4 w-4" />
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-stone-900 flex items-center gap-1">
                      <i className={`ti ${mood?.icon}`} aria-hidden="true" />
                      {mood?.label}
                    </p>

                    <p className="text-[10px] text-stone-500">
                      {new Date(entry.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-2 flex flex-wrap gap-1.5">
                {(entry.symptoms || []).map((symptom) => (
                  <span
                    key={symptom}
                    className="flex items-center gap-1 rounded-full border bg-white px-2 py-0.5 text-[10px] text-stone-700"
                    style={{
                      borderColor: "oklch(0.9 0.02 220)",
                    }}
                  >
                    <span style={{ color: "oklch(0.56 0.09 200)" }}>
                      {getSymptomIcon(symptom)}
                    </span>
                    {symptom}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  )}

      <div
        className="rounded-3xl border bg-white p-4 shadow-sm"
        style={{
          borderColor: "oklch(0.9 0.02 220)",
        }}
      >
        <div className="mb-4">
          <h3
            className="text-lg font-semibold"
            style={{
              color: "oklch(0.56 0.09 200)",
            }}
          >
            Symptom Checklist
          </h3>

          <p className="text-xs text-stone-500">
            Common symptoms you can quickly track
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {quickSymptoms.map((symptom) => (
            <div
              key={symptom.id}
              className="flex items-center gap-3 rounded-2xl border p-3 transition-all hover:-translate-y-0.5 hover:shadow-sm"
              style={{
                borderColor: "oklch(0.92 0.02 220)",
                backgroundColor: "oklch(0.98 0.01 220)",
              }}
            >
              <div
                className="flex h-10 w-10 items-center justify-center rounded-xl text-white shadow-sm"
                style={{
                  background:
                    "linear-gradient(135deg, oklch(0.62 0.11 220), oklch(0.56 0.09 200))",
                }}
              >
                {getSymptomIcon(symptom.label)}
              </div>

              <div>
                <p className="text-sm font-medium text-stone-800">
                  {symptom.label}
                </p>

                <p className="text-[11px] text-stone-500">
                  Track symptom
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

