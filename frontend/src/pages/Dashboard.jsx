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
  return (
    <div className="space-y-3">
      <section className="rounded-2xl bg-stone-900 p-5 text-white">
        <p className="text-xs opacity-70">Good morning</p>
        <h1 className="text-2xl font-semibold">{displayName}</h1>
        <p className="text-xs opacity-70">How are you breathing today?</p>
      </section>

      <AQIBanner city={city} aqi={aqi} />

      <div className="grid grid-cols-4 gap-2">
        <StatBox value={homeStats.latestMoodIcon} label={homeStats.latestMoodLabel} />
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
