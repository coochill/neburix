import { moods, quickSymptoms } from "../lib/mockData";

const moodColors = { 5: "#1D9E75", 4: "#5DCAA5", 3: "#888780", 2: "#F0997B", 1: "#D85A30" };

export default function QuickLog({ mood, symptomIds, onMood, onSymptomToggle, onSubmit }) {
  return (
    <div className="rounded-3xl border border-white/50 bg-white/80 p-5 shadow-[0_8px_30px_rgb(0,0,0,0.06)] backdrop-blur-sm">
      <h3 className="text-sm font-semibold" style={{ color: "oklch(0.56 0.09 200)" }}>Quick log</h3>

      <div className="grid grid-cols-5 gap-2 mb-3">
        {moods.map((item) => {
          const selected = mood === item.value;
          return (
            <button
              key={item.value}
              onClick={() => onMood(item.value)}
              className={`rounded-xl border p-2 text-center text-xs transition-all ${
                selected ? "border-teal-500 bg-teal-50 text-teal-800" : "border-stone-200 bg-white text-stone-500"
              }`}
            >
              <i
                className={`ti ${item.icon} text-xl block mb-1`}
                style={{ color: moodColors[item.value] }}
                aria-hidden="true"
              />
              {item.label}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-4 gap-2">
        {quickSymptoms.map((item) => {
          const selected = symptomIds.includes(item.id);
          return (
            <button
              key={item.id}
              onClick={() => onSymptomToggle(item.id)}
              className={`rounded-xl border p-2 text-center text-[11px] transition-all ${
                selected ? "border-rose-300 bg-rose-50 text-rose-700" : "border-stone-200 bg-white text-stone-500"
              }`}
            >
              <i
                className={`ti ${item.icon} text-xl block mb-1`}
                style={{ color: selected ? "#D4537E" : "#1D9E75" }}
                aria-hidden="true"
              />
              {item.label}
            </button>
          );
        })}
      </div>

      <button
        onClick={onSubmit}
        className="mt-5 w-full rounded-2xl py-3 text-sm font-semibold text-white shadow-lg transition-all duration-300"
        style={{ background: "linear-gradient(135deg, oklch(0.62 0.11 220), oklch(0.56 0.09 200))" }}
      >
        Log now
      </button>
    </div>
  );
}

