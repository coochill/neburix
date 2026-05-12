export function detectTriggers(logs) {
  const triggerCount = {};

  logs.forEach((log) => {
    (log.triggers || []).forEach((trigger) => {
      triggerCount[trigger] = (triggerCount[trigger] || 0) + 1;
    });
  });

  const sorted = Object.entries(triggerCount).sort((a, b) => b[1] - a[1]);
  if (!sorted.length) {
    return { topTrigger: "None", count: 0, ratio: "1.0" };
  }

  const [topTrigger, count] = sorted[0];
  const withTrigger = logs.filter((log) => (log.triggers || []).includes(topTrigger));
  const withoutTrigger = logs.filter((log) => !(log.triggers || []).includes(topTrigger));

  const avgWith = average(withTrigger.map((log) => log.severity));
  const avgWithout = average(withoutTrigger.map((log) => log.severity)) || 1;
  const ratio = (avgWith / avgWithout).toFixed(1);

  return { topTrigger, count, ratio };
}

export function calcRiskScore({ symptomSeverity, aqi, triggerExposure, missedMedication }) {
  const score =
    symptomSeverity * 0.4 +
    (aqi / 200) * 0.3 +
    triggerExposure * 0.2 +
    missedMedication * 0.1;

  if (score < 0.35) {
    return { score, level: "LOW", reason: "Symptoms and exposure are currently manageable." };
  }

  if (score < 0.65) {
    return { score, level: "MEDIUM", reason: "AQI and symptom pattern suggest caution today." };
  }

  return { score, level: "HIGH", reason: "Multiple indicators are elevated. Keep your rescue inhaler nearby." };
}

export function summarizeWeek(logs, medsTakenPct, avgAqi) {
  const normalizedLogs = normalizeReportLogs(logs, avgAqi);
  const triggerInsight = detectTriggers(normalizedLogs);
  const avgWheezing = average(normalizedLogs.map((log) => log.wheezing));
  const avgCoughing = average(normalizedLogs.map((log) => log.coughing));
  const avgShortness = average(normalizedLogs.map((log) => log.shortness));
  const avgSeverity = average(normalizedLogs.map((log) => log.severity));

  const topTriggers = Object.entries(
    normalizedLogs.reduce((acc, log) => {
      (log.triggers || []).forEach((trigger) => {
        acc[trigger] = (acc[trigger] || 0) + 1;
      });
      return acc;
    }, {}),
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([trigger, count]) => ({ trigger, count }));

  const sortedWorstAqi = [...normalizedLogs]
    .filter((log) => Number.isFinite(log.aqi))
    .sort((a, b) => b.aqi - a.aqi)
    .slice(0, 3)
    .map((log) => ({ day: log.day, aqi: Math.round(log.aqi) }));

  const safeMedsTakenPct = Math.max(0, Math.min(100, Math.round(medsTakenPct)));
  const effectiveAvgAqi = normalizedLogs.length
    ? average(normalizedLogs.map((log) => log.aqi || avgAqi || 0))
    : avgAqi;

  const risk = calcRiskScore({
    symptomSeverity: Math.min(avgSeverity / 8, 1),
    aqi: effectiveAvgAqi || 0,
    triggerExposure: normalizedLogs.length ? Math.min(triggerInsight.count / normalizedLogs.length, 1) : 0,
    missedMedication: 1 - safeMedsTakenPct / 100,
  });

  const recommendations = buildWeeklyRecommendations({
    riskLevel: risk.level,
    medsTakenPct: safeMedsTakenPct,
    avgAqi: effectiveAvgAqi || 0,
    topTrigger: triggerInsight.topTrigger,
  });

  return {
    avgWheezing: avgWheezing.toFixed(1),
    avgCoughing: avgCoughing.toFixed(1),
    avgShortness: avgShortness.toFixed(1),
    topTrigger: triggerInsight.topTrigger,
    topTriggerCount: triggerInsight.count,
    topTriggers,
    medsTakenPct: safeMedsTakenPct,
    avgAqi: Math.round(effectiveAvgAqi || 0),
    aqiBand: getAQIStatus(effectiveAvgAqi || 0),
    triggerRatio: triggerInsight.ratio,
    symptomChart: {
      labels: normalizedLogs.map((log) => log.day),
      wheezing: normalizedLogs.map((log) => log.wheezing),
      coughing: normalizedLogs.map((log) => log.coughing),
      shortness: normalizedLogs.map((log) => log.shortness),
    },
    worstAqiDays: sortedWorstAqi,
    weeklyRisk: {
      scorePct: Math.round(risk.score * 100),
      level: risk.level,
      reason: risk.reason,
    },
    recommendations,
  };
}

export function getAQIStatus(aqi) {
  if (aqi <= 50) return "Good";
  if (aqi <= 100) return "Moderate";
  if (aqi <= 150) return "Unhealthy Sensitive";
  if (aqi <= 200) return "Unhealthy";
  return "Hazardous";
}

export function average(values) {
  if (!values.length) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function normalizeReportLogs(logs, fallbackAqi) {
  if (!Array.isArray(logs) || !logs.length) {
    return [];
  }

  const last7 = logs.slice(0, 7);

  return last7.map((log, index) => {
    const symptoms = Array.isArray(log.symptoms) ? log.symptoms : [];
    const wheezing = toMetricValue(log.wheezing, symptoms.includes("wheezing"));
    const coughing = toMetricValue(log.coughing, symptoms.includes("coughing"));
    const shortness = toMetricValue(log.shortness, symptoms.includes("shortness"));
    const tightness = symptoms.includes("tightness") ? 1 : 0;
    const severity = Number.isFinite(Number(log.severity))
      ? Number(log.severity)
      : wheezing + coughing + shortness + tightness;

    const day = log.day || formatDay(log.createdAt, index);
    const rawAqi = Number(log.aqi ?? log.aqiSnapshot ?? fallbackAqi ?? 0);
    const aqi = Number.isFinite(rawAqi) ? rawAqi : 0;

    return {
      ...log,
      day,
      wheezing,
      coughing,
      shortness,
      severity,
      aqi,
      triggers: Array.isArray(log.triggers) ? log.triggers : [],
    };
  });
}

function toMetricValue(metric, fallbackFlag) {
  const parsed = Number(metric);
  if (Number.isFinite(parsed)) {
    return Math.max(0, parsed);
  }
  return fallbackFlag ? 1 : 0;
}

function formatDay(createdAt, index) {
  if (createdAt) {
    const date = new Date(createdAt);
    if (!Number.isNaN(date.getTime())) {
      return date.toLocaleDateString(undefined, { weekday: "short" });
    }
  }

  const fallback = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  return fallback[index] || `Day ${index + 1}`;
}

function buildWeeklyRecommendations({ riskLevel, medsTakenPct, avgAqi, topTrigger }) {
  const items = [];

  if (riskLevel === "HIGH") {
    items.push("Review controller regimen and rescue inhaler usage with clinician.");
  } else if (riskLevel === "MEDIUM") {
    items.push("Continue close symptom monitoring and reassess in 7 days.");
  } else {
    items.push("Maintain current plan and continue routine preventive measures.");
  }

  if (medsTakenPct < 80) {
    items.push("Medication adherence below target (<80%); consider reminder and refill check.");
  }

  if (avgAqi > 100) {
    items.push("Limit outdoor exertion during poor AQI periods and use mask/air filtration.");
  }

  if (topTrigger && topTrigger !== "None") {
    items.push(`Prioritize trigger mitigation strategy for ${topTrigger}.`);
  }

  return items.slice(0, 4);
}
