import { useState } from "react";
import Card from "../components/Card";
import { Check, Plus, Pill, Clock } from "lucide-react";

const PRIMARY = "oklch(0.6 0.118 184.704)";

export default function Meds({ meds, onToggle, onAdd, onExport }) {
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [dose, setDose] = useState("");
  const [time, setTime] = useState("");
  const [type, setType] = useState("Maintenance inhaler");

  const taken = meds.filter((med) => med.taken).length;
  const adherence = meds.length ? Math.round((taken / meds.length) * 100) : 0;

  function resetForm() {
    setName("");
    setDose("");
    setTime("");
    setType("Maintenance inhaler");
  }

  function submitMedication(event) {
    event.preventDefault();
    if (!name.trim()) return;

    onAdd({
      name: name.trim(),
      dose: dose.trim() || "-",
      time: time || "-",
      type,
    });

    resetForm();
    setShowForm(false);
  }

  return (
    <div className="space-y-5">

      {/* Header */}
     <header
  className="relative overflow-hidden rounded-2xl p-4 text-white shadow-md"
  style={{
    background:
      "linear-gradient(135deg, oklch(0.62 0.11 215), oklch(0.56 0.09 205))",
  }}
>
  <div className="absolute -right-8 -top-8 h-28 w-28 rounded-xl bg-white/10 blur-2xl" />

  <div className="relative">
    <h2 className="text-2xl font-semibold tracking-tight">
      Medications
    </h2>

    <p className="mt-1 text-xs text-white/80">
      Track adherence and export doctor report
    </p>

    <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 text-[11px]">
      <Pill className="h-3 w-3" />
      {adherence}% adherence
    </div>
  </div>
</header>

      {/* Med list */}
      <Card title="Today">
        <div className="space-y-3">

          {meds.map((med) => (
            <div
              key={med.id}
              className="flex items-center justify-between rounded-2xl border border-stone-100 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex items-center gap-3">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-xl text-white"
                  style={{ backgroundColor: PRIMARY }}
                >
                  <Pill className="h-5 w-5" />
                </div>

                <div>
                  <p className="text-sm font-semibold text-stone-900">
                    {med.name} — {med.dose}
                  </p>

                  <p className="flex items-center gap-1 text-xs text-stone-500">
                    <Clock className="h-3 w-3" />
                    {med.type} • {med.time}
                  </p>
                </div>
              </div>

              <button
                onClick={() => onToggle(med.id)}
                className="rounded-full px-3 py-1.5 text-xs font-semibold transition"
                style={{
                  backgroundColor: med.taken ? PRIMARY : "#f4f4f5",
                  color: med.taken ? "white" : "#52525b",
                }}
              >
                {med.taken ? (
                  <span className="flex items-center gap-1">
                    <Check className="h-3 w-3" /> Taken
                  </span>
                ) : (
                  "Mark"
                )}
              </button>
            </div>
          ))}

          {/* Add button */}
          <button
            onClick={() => setShowForm((prev) => !prev)}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-stone-300 bg-white py-3 text-sm font-semibold text-stone-700 transition hover:bg-stone-50"
          >
            <Plus className="h-4 w-4" />
            {showForm ? "Cancel" : "Add medication"}
          </button>

          {/* Form */}
          {showForm && (
            <form
              onSubmit={submitMedication}
              className="space-y-3 rounded-2xl border border-stone-200 bg-stone-50 p-4"
            >
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Medication name"
                className="w-full rounded-xl border border-stone-300 px-3 py-2 text-sm outline-none focus:border-stone-900"
                required
              />

              <div className="grid grid-cols-2 gap-2">
                <input
                  value={dose}
                  onChange={(e) => setDose(e.target.value)}
                  placeholder="Dose"
                  className="w-full rounded-xl border border-stone-300 px-3 py-2 text-sm outline-none focus:border-stone-900"
                />
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full rounded-xl border border-stone-300 px-3 py-2 text-sm outline-none focus:border-stone-900"
                />
              </div>

              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full rounded-xl border border-stone-300 px-3 py-2 text-sm outline-none focus:border-stone-900"
              >
                <option>Maintenance inhaler</option>
                <option>Rescue inhaler</option>
                <option>Oral medication</option>
                <option>Nebulizer</option>
              </select>

              <button
                type="submit"
                className="w-full rounded-xl px-3 py-2 text-sm font-semibold text-white shadow-md transition hover:opacity-90"
                style={{ backgroundColor: PRIMARY }}
              >
                Save medication
              </button>
            </form>
          )}
        </div>
      </Card>

      {/* Adherence */}
      <Card title="Medication adherence">
        <div className="space-y-2">
          <p className="text-sm text-stone-700">
            {adherence}% adherence this week
          </p>

          <div className="h-2 w-full rounded-full bg-stone-200">
            <div
              className="h-2 rounded-full"
              style={{
                width: `${adherence}%`,
                backgroundColor: PRIMARY,
              }}
            />
          </div>
        </div>
      </Card>

      {/* Export */}
      <button
        onClick={onExport}
        className="w-full rounded-2xl py-3 text-sm font-semibold text-white shadow-lg transition hover:opacity-90"
        style={{
          background: `linear-gradient(135deg, ${PRIMARY}, oklch(0.52 0.1 200))`,
        }}
      >
        Download Doctor PDF Report
      </button>
    </div>
  );
}