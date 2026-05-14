import { Home, Activity, TrendingUp, Pill } from "lucide-react";

const tabs = [
  { id: "dashboard", icon: Home, label: "Home" },
  { id: "health-log", icon: Activity, label: "Health Log" },
  { id: "trends", icon: TrendingUp, label: "Trends" },
  { id: "meds", icon: Pill, label: "Meds" },
];

export default function Navbar({ activeTab, onChange }) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 mx-auto flex w-full max-w-md gap-1 border-t border-gray-200 bg-white px-2 py-2">
      {tabs.map((tab) => {
        const active = tab.id === activeTab;
        const Icon = tab.icon;

        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`flex flex-1 flex-col items-center rounded-2xl px-1 py-2 text-[10px] transition-all duration-200 ${
              active
                ? "text-white shadow-md"
                : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
            }`}
            style={
              active
                ? {
                    backgroundColor: "oklch(0.6 0.118 184.704)",
                  }
                : {}
            }
          >
            <Icon className="h-5 w-5" />
            <span className="mt-1">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}