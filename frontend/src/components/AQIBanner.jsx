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
    <div className={`rounded-3xl border p-4 shadow-sm ${bannerTheme(aqi)}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold">
            Air quality · {city}
          </p>

          <p className="text-xs">
            {status}
          </p>
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-lg font-bold shadow-sm">
          {aqi}
        </div>

      </div>
    </div>
  );
}

