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
  for (let i = 6; i >= 0; i -= 1) {
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
        borderColor: "#5b50d6",
        backgroundColor: "rgba(91,80,214,0.08)",
        fill: true,
        tension: 0.35,
      },
      {
        label: "Coughing",
        data: trendModel.coughing,
        borderColor: "#dd6b2f",
        backgroundColor: "rgba(221,107,47,0.08)",
        fill: true,
        tension: 0.35,
      },
      {
        label: "Shortness",
        data: trendModel.shortness,
        borderColor: "#0f9b6f",
        backgroundColor: "rgba(15,155,111,0.08)",
        fill: true,
        tension: 0.35,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true, labels: { boxWidth: 10, boxHeight: 10 } },
    },
    scales: {
      y: { min: 0, max: trendModel.yMax, ticks: { stepSize: 1 } },
      x: { grid: { display: false } },
    },
  };

  return (
    <div className="space-y-3">
      <header>
        <h2 className="text-xl font-semibold text-stone-900">Trends</h2>
        <p className="text-xs text-stone-500">Your weekly symptom pattern from saved logs</p>
      </header>

      <section className="space-y-2">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-stone-500">Air quality</p>
        <Air city={city} aqi={aqi} loading={loading} error={error} onCity={onCity} showHeader={false} />
      </section>

      <Card title="Symptom trends - this week">
        <div className="h-52">
          <Line data={data} options={options} />
        </div>
      </Card>

      <Card title="Smart insight engine">
        <p className="text-sm text-stone-700">
          Most reported symptom this week: <strong>{trendModel.topSymptom}</strong> ({trendModel.topSymptomCount} logs).
        </p>
        <p className="mt-1 text-xs text-stone-500">
          Trigger model: {triggerInsight.topTrigger} ({triggerInsight.count}x historical seed data)
        </p>
      </Card>
    </div>
  );
}
