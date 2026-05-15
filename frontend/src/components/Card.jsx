  export default function Card({ title, right, children }) {
    return (
      <section className="rounded-3xl border border-white/40 bg-white/80 p-5 shadow-[0_8px_30px_rgb(0,0,0,0.06)] backdrop-blur-sm">
        {(title || right) && (
          <header className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold" style={{ color: "oklch(0.56 0.09 200)" }}>{title}</h3>
            {right}
          </header>
        )}
        {children}
      </section>
    );
  }
