import { Home, Activity, TrendingUp, Pill } from "lucide-react";

const tabs = [
  { id: "dashboard", icon: Home, label: "Home" },
  { id: "health-log", icon: Activity, label: "Health Log" },
  { id: "trends", icon: TrendingUp, label: "Trends" },
  { id: "meds", icon: Pill, label: "Meds" },
];

export default function Navbar({ activeTab, onChange }) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 mx-auto flex w-full max-w-md gap-2 border-t border-stone-200 bg-white/90 px-3 py-3 backdrop-blur-xl">
      {tabs.map((tab) => {
        const active = tab.id === activeTab;
        const Icon = tab.icon;

        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`flex flex-1 flex-col items-center justify-center rounded-2xl px-2 py-2 text-[11px] font-medium transition-all duration-300 ${
              active
                ? "text-white shadow-lg scale-[1.02]"
                : "text-stone-500 hover:bg-stone-100 hover:text-stone-900"
            }`}
            style={
              active
                ? {
                    background:
                      "linear-gradient(135deg, oklch(0.62 0.11 220), oklch(0.56 0.09 200))",
                  }
                : {}
            }
          >
            <Icon
              className={`mb-1 transition-all duration-300 ${
                active ? "h-5 w-5" : "h-5 w-5"
              }`}
            />

            <span>{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}