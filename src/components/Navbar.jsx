const tabs = [
  { id: "dashboard", icon: "🏠", label: "Home" },
  { id: "health-log", icon: "🩺", label: "Health Log" },
  { id: "trends", icon: "📈", label: "Trends" },
  { id: "meds", icon: "💊", label: "Meds" },
];

export default function Navbar({ activeTab, onChange }) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 mx-auto flex w-full max-w-md gap-1 border-t border-stone-200 bg-white px-2 py-2">
      {tabs.map((tab) => {
        const active = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`flex flex-1 flex-col items-center rounded-xl px-1 py-2 text-[10px] transition ${
              active ? "bg-stone-900 text-white" : "text-stone-500 hover:bg-stone-100"
            }`}
          >
            <span className="text-base leading-none">{tab.icon}</span>
            <span className="mt-1">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
