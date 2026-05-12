import Log from "./Log";

export default function HealthLog({ logs, logError }) {
  return (
    <div className="space-y-4">
      <header>
        <h2 className="text-xl font-semibold text-stone-900">Health Log</h2>
        <p className="text-xs text-stone-500">Track your symptom history</p>
      </header>

      <section className="space-y-2">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-stone-500">Symptom logs</p>
        <Log logs={logs} error={logError} showHeader={false} />
      </section>
    </div>
  );
}
