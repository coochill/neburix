import Log from "./Log";
import { Activity } from "lucide-react";

export default function HealthLog({ logs, logError }) {
  return (
    <div className="space-y-4">
      {/* Header */}
      <header
        className="relative overflow-hidden rounded-2xl p-4 text-white shadow-md"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.62 0.11 220), oklch(0.56 0.09 200))",
        }}
      >
        <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-white/10 blur-2xl" />

        <div className="relative flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.18em] text-white/70">
              Health Monitoring
            </p>

            <h2 className="mt-1 text-2xl font-semibold tracking-tight">
              Health Log
            </h2>

            <p className="mt-1 text-xs text-white/80">
              Track your symptom history and breathing wellness
            </p>
          </div>

          <div className="rounded-xl bg-white/15 p-2.5 backdrop-blur">
            <Activity className="h-5 w-5 text-white" />
          </div>
        </div>
      </header>

      {/* Logs */}
      <section className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <div>
            <p
              className="text-base font-semibold"
              style={{
                color: "oklch(0.56 0.09 200)",
              }}
            >
              Symptom Logs
            </p>

            <p className="text-[11px] text-stone-500">
              Your recent tracking activity
            </p>
          </div>

          <div
            className="rounded-full px-2.5 py-1 text-[11px] font-medium text-white shadow-sm"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.62 0.11 220), oklch(0.56 0.09 200))",
            }}
          >
            {logs.length} Logs
          </div>
        </div>

        
          <Log
            logs={logs}
            error={logError}
            showHeader={false}
          />
        
      </section>
    </div>
  );
}