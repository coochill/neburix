const WAQI_TOKEN = import.meta.env.VITE_WAQI_TOKEN;

const CITY_FEEDS = {
  manila: "manila",
  binan: "geo:14.3281;121.1135",
  "batangas city": "geo:13.7566;121.0582",
};

const FALLBACK_AQI = {
  manila: 82,
  binan: 68,
  "batangas city": 61,
};

function normalizeCityKey(city) {
  return city
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function parseAqi(value) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) {
    return null;
  }
  return parsed;
}

export async function fetchAQI(city) {
  const cityKey = normalizeCityKey(city);
  const cityFeed = CITY_FEEDS[cityKey] || cityKey;
  const normalizedCity = encodeURIComponent(cityFeed);
  const proxyUrl = `/api/aqi?city=${normalizedCity}`;

  // First try Flask backend proxy to keep token server-side.
  try {
    const proxyRes = await fetch(proxyUrl);
    if (proxyRes.ok) {
      const proxyData = await proxyRes.json();
      if (proxyData?.status === "ok") {
        const parsedAqi = parseAqi(proxyData?.data?.aqi);
        if (parsedAqi === null) {
          throw new Error("Proxy AQI value was invalid");
        }

        return {
          aqi: parsedAqi,
          city: proxyData.data.city?.name || city,
          dominantPollutant: proxyData.data.dominentpol,
        };
      }

      if (proxyData?.message) {
        throw new Error(proxyData.message);
      }
    }
  } catch {
    // Fall through to direct client request for local demo mode.
  }

  try {
    const res = await fetch(`https://api.waqi.info/feed/${normalizedCity}/?token=${WAQI_TOKEN}`);
    const data = await res.json();

    if (data.status !== "ok") {
      throw new Error("WAQI request failed");
    }

    const parsedAqi = parseAqi(data?.data?.aqi);
    if (parsedAqi === null) {
      throw new Error("WAQI AQI value was invalid");
    }

    return {
      aqi: parsedAqi,
      city: data.data.city?.name || city,
      dominantPollutant: data.data.dominentpol,
    };
  } catch {
    const fallback = FALLBACK_AQI[cityKey];
    if (typeof fallback === "number") {
      return {
        aqi: fallback,
        city,
        dominantPollutant: "pm25",
        stale: true,
      };
    }
    throw new Error("Unable to fetch AQI data from proxy or WAQI API");
  }
}
