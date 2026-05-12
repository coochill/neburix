export default function StatBox({ value, label, valueClassName = "" }) {
  return (
    <div className="rounded-xl border border-stone-200 bg-white px-3 py-3 text-center shadow-sm">
      <div className={`text-lg font-semibold ${valueClassName}`}>{value}</div>
      <div className="mt-1 text-[11px] text-stone-500">{label}</div>
    </div>
  );
}
