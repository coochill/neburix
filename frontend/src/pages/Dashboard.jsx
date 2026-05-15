import AQIBanner from "../components/AQIBanner";
import Card from "../components/Card";
import QuickLog from "../components/QuickLog";
import StatBox from "../components/StatBox";

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
        className="relative overflow-hidden rounded-3xl p-6 text-white shadow-xl"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.62 0.11 220), oklch(0.56 0.09 200))",
        }}
      >
    <p className="text-xs opacity-80">HELLO!</p>
    <h1 className="mt-1 text-3xl font-bold tracking-tight">{displayName}</h1>
    <p className="text-xs opacity-80">How are you breathing today?</p>
  </section>


      <AQIBanner city={city} aqi={aqi} />

      <div className="grid grid-cols-4 gap-2">
        <StatBox value={<i className={`ti ${homeStats.latestMoodIcon}`}style={{ color: moodColors[homeStats.latestMoodValue], fontSize: "1.5rem" }}aria-hidden="true"/> }label={homeStats.latestMoodLabel}/>
        <StatBox value={String(homeStats.latestSymptomCount)} label="Symptoms" valueClassName="text-emerald-700" />
        <StatBox value={homeStats.topSymptom} label="Top pattern" />
        <StatBox value={Math.round(risk.score * 100)} label="Risk score" valueClassName="text-sky-800" />
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
