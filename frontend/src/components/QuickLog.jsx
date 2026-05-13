import { moods, quickSymptoms } from "../lib/mockData";

export default function QuickLog({ mood, symptomIds, onMood, onSymptomToggle, onSubmit }) {
  return (
    <div className="space-y-3 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
      <h3 className="text-sm font-semibold">Quick log</h3>

      <div className="grid grid-cols-5 gap-2">
        {moods.map((item) => {
          const selected = mood === item.value;
          return (
            <button
              key={item.value}
              onClick={() => onMood(item.value)}
              className={`rounded-xl border p-2 text-center text-xs ${
                selected ? "border-stone-900 bg-stone-900 text-white" : "border-stone-200 bg-stone-50"
              }`}
            >
              <div className="text-base">{item.icon}</div>
              <div className="mt-1">{item.label}</div>
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
              className={`rounded-xl border p-2 text-center text-[11px] ${
                selected ? "border-rose-300 bg-rose-100" : "border-stone-200 bg-stone-50"
              }`}
            >
              <div>{item.icon}</div>
              <div className="mt-1">{item.label}</div>
            </button>
          );
        })}
      </div>

      <button
        onClick={onSubmit}
        className="w-full rounded-xl bg-stone-900 py-2 text-sm font-semibold text-white transition hover:bg-stone-700"
      >
        Log now
      </button>
    </div>
  );
}
