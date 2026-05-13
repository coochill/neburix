import { getAQIStatus } from "../lib/insights";

function bannerTheme(aqi) {
  if (aqi <= 50) return "border-emerald-200 bg-emerald-50 text-emerald-900";
  if (aqi <= 100) return "border-amber-200 bg-amber-50 text-amber-900";
  if (aqi <= 150) return "border-orange-200 bg-orange-50 text-orange-900";
  return "border-rose-200 bg-rose-50 text-rose-900";
}

export default function AQIBanner({ city, aqi }) {
  const status = getAQIStatus(aqi);

  return (
    <div className={`rounded-xl border p-3 ${bannerTheme(aqi)}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold">Air quality · {city}</p>
          <p className="text-xs opacity-80">{status}</p>
        </div>
        <p className="rounded-md bg-white/80 px-2 py-1 font-mono text-sm font-semibold">{aqi}</p>
      </div>
    </div>
  );
}
