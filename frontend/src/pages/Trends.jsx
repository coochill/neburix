import {
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
} from "chart.js";
import { useMemo } from "react";
import { Line } from "react-chartjs-2";
import Air from "./Air";
import Card from "../components/Card";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

function buildLast7Days() {
  const days = [];
  const now = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    days.push(d);
  }
  return days;
}

function dayKey(date) {
  return date.toISOString().slice(0, 10);
}

export default function Trends({ logs, triggerInsight, city, aqi, loading, error, onCity }) {
  const trendModel = useMemo(() => {
    const days = buildLast7Days();
    const labels = days.map((d) => d.toLocaleDateString(undefined, { weekday: "short" }));
    const keys = days.map(dayKey);

    const wheezing = new Array(7).fill(0);
    const coughing = new Array(7).fill(0);
    const shortness = new Array(7).fill(0);
    const symptomCounts = { wheezing: 0, coughing: 0, shortness: 0, tightness: 0 };

    (logs || []).forEach((entry) => {
      if (!entry?.createdAt) return;
      const idx = keys.indexOf(dayKey(new Date(entry.createdAt)));
      if (idx < 0) return;

      const symptoms = Array.isArray(entry.symptoms) ? entry.symptoms : [];
      if (symptoms.includes("wheezing")) wheezing[idx] += 1;
      if (symptoms.includes("coughing")) coughing[idx] += 1;
      if (symptoms.includes("shortness")) shortness[idx] += 1;

      symptoms.forEach((symptom) => {
        symptomCounts[symptom] = (symptomCounts[symptom] || 0) + 1;
      });
    });

    const totals = Object.entries(symptomCounts).sort((a, b) => b[1] - a[1]);
    const topSymptom = totals[0]?.[1] > 0 ? totals[0][0] : "none";
    const topSymptomCount = totals[0]?.[1] || 0;
    const yMax = Math.max(2, ...wheezing, ...coughing, ...shortness) + 1;

    return { labels, wheezing, coughing, shortness, topSymptom, topSymptomCount, yMax };
  }, [logs]);

  const data = {
    labels: trendModel.labels,
    datasets: [
      {
        label: "Wheezing",
        data: trendModel.wheezing,
        borderColor: "oklch(0.62 0.11 220)",
        backgroundColor: "rgba(90,120,255,0.10)",
        fill: true,
        tension: 0.35,
      },
      {
        label: "Coughing",
        data: trendModel.coughing,
        borderColor: "oklch(0.56 0.09 200)",
        backgroundColor: "rgba(80,110,220,0.10)",
        fill: true,
        tension: 0.35,
      },
      {
        label: "Shortness",
        data: trendModel.shortness,
        borderColor: "oklch(0.62 0.11 220)",
        backgroundColor: "rgba(70,100,200,0.08)",
        fill: true,
        tension: 0.35,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        labels: {
          boxWidth: 10,
          boxHeight: 10,
          color: "#334155",
        },
      },
    },
    scales: {
      y: {
        min: 0,
        max: trendModel.yMax,
        ticks: { stepSize: 1, color: "#64748b" },
        grid: { color: "rgba(148,163,184,0.2)" },
      },
      x: {
        grid: { display: false },
        ticks: { color: "#64748b" },
      },
    },
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <header
        className="relative overflow-hidden rounded-2xl p-5 text-white shadow-lg"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.62 0.11 220), oklch(0.56 0.09 200))",
        }}
      >
        <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/10 blur-3xl" />

        <h2 className="text-2xl font-semibold">Trends</h2>
        <p className="text-sm text-white/80">
          Your weekly symptom pattern and air quality insights
        </p>
      </header>

      {/* Air quality */}
      <Card title="Air quality">
        <Air city={city} aqi={aqi} loading={loading} error={error} onCity={onCity} showHeader={false} />
      </Card>

      {/* Chart */}
      <Card title="Symptom trends - this week">
        <div className="h-52">
          <Line data={data} options={options} />
        </div>
      </Card>

      {/* Insight */}
      <div
        className="rounded-3xl p-5 text-white shadow-lg"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.62 0.11 220), oklch(0.56 0.09 200))",
        }}
      >
        <h3 className="text-lg font-semibold">Smart insight engine</h3>

        <p className="mt-2 text-sm text-white/85">
          Most reported symptom this week:{" "}
          <strong>{trendModel.topSymptom}</strong> ({trendModel.topSymptomCount} logs)
        </p>

        <p className="mt-1 text-xs text-white/70">
          Trigger model: {triggerInsight.topTrigger} ({triggerInsight.count}x historical data)
        </p>
      </div>
    </div>
  );
}