import AQIBanner from "../components/AQIBanner";
import Card from "../components/Card";
import QuickLog from "../components/QuickLog";
import StatBox from "../components/StatBox";
import { Home, Activity, TrendingUp, Gauge } from "lucide-react";

export default function Dashboard({
  displayName,
  city,
  aqi,
  risk,
  homeStats,
  triggerInsight,
  quickMood,
  quickSymptoms,
  onQuickMood,
  onQuickSymptom,
  onQuickSubmit,
}) {
  const moodColors = { 5: "#1D9E75", 4: "#5DCAA5", 3: "#888780", 2: "#F0997B", 1: "#D85A30" };
  return (
    <div className="space-y-3">
  <section
        className="relative overflow-hidden rounded-2xl p-4 text-white shadow-md"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.62 0.11 220), oklch(0.56 0.09 200))",
        }}
      >
        {/* Background glow */}
        <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-white/10 blur-3xl" />

        <div className="relative flex items-center justify-between">

          {/* LEFT CONTENT */}
          <div>
            <p className="text-[10px] uppercase tracking-[0.18em] text-white/70">
              Hello!
            </p>

            <h2 className="mt-1 text-2xl font-semibold tracking-tight">
              {displayName}
            </h2>

            <p className="mt-1 text-xs text-white/80">
              How are you breathing today?
            </p>
          </div>

          {/* HOME ICON */}
          <div className="rounded-xl bg-white/15 p-2.5 backdrop-blur">
            <Home className="h-5 w-5 text-white" />
          </div>

        </div>
      </section>

      <AQIBanner city={city} aqi={aqi} />

<div className="grid grid-cols-4 gap-2">

  {/* Mood */}
  <StatBox
    value={
      <div className="relative w-full">
        <i
          className={`ti ${homeStats.latestMoodIcon}`}
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            color: moodColors[homeStats.latestMoodValue] || "oklch(0.62 0.11 220)",
            fontSize: "1.2rem",
          }}
          aria-hidden="true"
        />
      </div>
    }
    label={homeStats.latestMoodLabel}
  />

  {/* Symptoms */}
  <StatBox
    value={
      <div className="relative w-full">
        <Activity
          className="absolute top-0 right-0 h-4 w-4"
          style={{ color: "oklch(0.62 0.11 150)" }}  // green tone
        />
        <span
          className="block text-center"
          style={{ color: "oklch(0.45 0.05 150)" }}
        >
          {String(homeStats.latestSymptomCount)}
        </span>
      </div>
    }
    label="Symptoms"
  />

  {/* Top Symptom */}
 <StatBox
  value={
    <div className="relative w-full">
      <TrendingUp
        className="absolute top-0 right-0 h-4 w-4"
        style={{ color: "oklch(0.55 0.05 220)" }}
      />

      <span
        className="block text-center transition-all duration-200"
        style={{
          fontSize:
            homeStats.topSymptom === "None" ? "0.75rem" : "0.875rem",
          color:
            homeStats.topSymptom === "None"
              ? "oklch(0.55 0.03 220)"
              : "oklch(0.40 0.03 220)",
        }}
      >
        {homeStats.topSymptom}
      </span>
    </div>
  }
  label="Top pattern"
/>

  {/* Risk Score */}
  <StatBox
    value={
      <div className="relative w-full">
        <Gauge
          className="absolute top-0 right-0 h-4 w-4"
          style={{ color: "oklch(0.60 0.12 250)" }} // blue tone
        />
        <span
          className="block text-center"
          style={{ color: "oklch(0.40 0.08 250)" }}
        >
          {Math.round(risk.score * 100)}
        </span>
      </div>
    }
    label="Risk score"
  />

</div>

      <Card title="Attack Risk Prediction">
        <p className="text-sm font-semibold text-amber-700">⚠️ Asthma risk today: {risk.level}</p>
        <p className="mt-1 text-xs text-stone-600">{risk.reason}</p>
      </Card>

      <Card title="Smart Trigger Detection">
        {homeStats.hasLogs ? (
          <>
            <p className="text-sm text-stone-700">
              <strong>{homeStats.topSymptom}</strong> appears most often in your recent logs.
            </p>
            <p className="mt-1 text-xs text-stone-500">
              Logged {homeStats.topSymptomCount} times in your symptom history.
            </p>
          </>
        ) : (
          <>
            <p className="text-sm text-stone-700">
              Dust exposure increased symptoms by <strong>{triggerInsight.ratio}x</strong> this week.
            </p>
            <p className="mt-1 text-xs text-stone-500">
              Top Trigger: {triggerInsight.topTrigger} ({triggerInsight.count} times)
            </p>
          </>
        )}
      </Card>

      <QuickLog
        mood={quickMood}
        symptomIds={quickSymptoms}
        onMood={onQuickMood}
        onSymptomToggle={onQuickSymptom}
        onSubmit={onQuickSubmit}
      />
    </div>
  );
}

