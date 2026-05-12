import Card from "../components/Card";
import AQIBanner from "../components/AQIBanner";
import { cities } from "../lib/mockData";

export default function Air({ city, aqi, loading, error, onCity, showHeader = true }) {
  return (
    <div className="space-y-3">
      {showHeader && (
        <header>
          <h2 className="text-xl font-semibold text-stone-900">Air quality</h2>
          <p className="text-xs text-stone-500">Live AQI from WAQI API</p>
        </header>
      )}

      <div className="flex gap-2 overflow-x-auto pb-1">
        {cities.map((name) => (
          <button
            key={name}
            onClick={() => onCity(name)}
            className={`rounded-full border px-3 py-1 text-xs ${
              city === name
                ? "border-stone-900 bg-stone-900 text-white"
                : "border-stone-200 bg-white text-stone-600"
            }`}
          >
            {name}
          </button>
        ))}
      </div>

      <AQIBanner city={city} aqi={aqi} />

      <Card title="AQI status">
        <p className="text-sm text-stone-700">
          {loading ? "Refreshing AQI..." : `Current AQI for ${city} is ${aqi}.`}
        </p>
        {error && <p className="mt-2 text-xs text-amber-700">{error}</p>}
      </Card>
    </div>
  );
}
