export default function StatBox({ value, label, valueClassName = "", className = "" }) {
  return (
    <div className={`flex h-full flex-col rounded-2xl border border-stone-100 bg-white px-3 py-4 text-center shadow-sm transition-all duration-300 ${className}`}>
      <div className={`flex min-h-[3.5rem] flex-col items-center justify-center text-xl font-bold text-stone-800 ${valueClassName}`}>
        {value}
      </div>

      <div className="mt-1 text-[11px] font-medium leading-tight text-stone-500">
        {label}
      </div>
    </div>
  );
}
