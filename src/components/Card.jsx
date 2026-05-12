export default function Card({ title, right, children }) {
  return (
    <section className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
      {(title || right) && (
        <header className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-stone-900">{title}</h3>
          {right}
        </header>
      )}
      {children}
    </section>
  );
}
