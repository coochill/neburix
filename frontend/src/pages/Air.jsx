import Card from "../components/Card";
import AQIBanner from "../components/AQIBanner";
import { cities } from "../lib/mockData";

export default function Air({ city, aqi, loading, error, onCity, showHeader = true }) {
  return (
    <div className="space-y-4">
      {/* Header */}
      {showHeader && (
        <header
          className="relative overflow-hidden rounded-3xl p-5 text-white shadow-lg"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.62 0.11 220), oklch(0.56 0.09 200))",
          }}
        >
          <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/10 blur-3xl" />

          <h2 className="text-2xl font-semibold">Air Quality</h2>
          <p className="text-sm text-white/80">
            Live AQI insights for respiratory health
          </p>
        </header>
      )}

      {/* City selector */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {cities.map((name) => {
          const active = city === name;

          return (
            <button
              key={name}
              onClick={() => onCity(name)}
              className={`rounded-full px-4 py-1.5 text-xs font-medium transition-all duration-200 whitespace-nowrap ${
                active
                  ? "text-white shadow-md"
                  : "text-stone-600 hover:text-stone-900 bg-white"
              }`}
              style={
                active
                  ? {
                      background:
                        "linear-gradient(135deg, oklch(0.62 0.11 220), oklch(0.56 0.09 200))",
                    }
                  : {
                      border: "1px solid rgba(148,163,184,0.3)",
                    }
              }
            >
              {name}
            </button>
          );
        })}
      </div>

      {/* AQI Banner */}
      <AQIBanner city={city} aqi={aqi} />

      {/* Status Card */}
      <div className="rounded-3xl bg-white p-5 shadow-sm border border-stone-100">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-stone-900">
            AQI Status
          </h3>

          <div
            className="rounded-full px-3 py-1 text-xs font-medium text-white shadow-sm"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.62 0.11 220), oklch(0.56 0.09 200))",
            }}
          >
            {city}
          </div>
        </div>

        <p className="mt-3 text-sm text-stone-700">
          {loading
            ? "Refreshing AQI..."
            : `Current air quality in ${city} is ${aqi}.`}
        </p>

        {error && (
          <p className="mt-2 text-xs text-amber-600">{error}</p>
        )}
      </div>
    </div>
  );
}