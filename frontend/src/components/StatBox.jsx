export default function StatBox({ value, label, valueClassName = "" }) {
  return (
    <div className="rounded-2xl border border-stone-100 bg-white px-3 py-4 text-center shadow-sm transition-all duration-300">
      <div
        className={`text-xl font-bold text-stone-800 ${valueClassName}`}
      >
        {value}
      </div>

      <div className="mt-1 text-[11px] font-medium text-stone-500">
        {label}
      </div>
    </div>
  );
}
