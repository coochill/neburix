import { useState } from "react";
import Card from "../components/Card";

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
    <div className="space-y-3">
      <header>
        <h2 className="text-xl font-semibold text-stone-900">Medications</h2>
        <p className="text-xs text-stone-500">Track adherence and export doctor report</p>
      </header>

      <Card title="Today">
        <div className="space-y-2">
          {meds.map((med) => (
            <div key={med.id} className="flex items-center justify-between rounded-xl border border-stone-200 p-3">
              <div>
                <p className="text-sm font-semibold text-stone-900">
                  {med.name} - {med.dose}
                </p>
                <p className="text-xs text-stone-500">
                  {med.type} - {med.time}
                </p>
              </div>
              <button
                onClick={() => onToggle(med.id)}
                className={`rounded-lg px-3 py-2 text-xs font-semibold ${
                  med.taken ? "bg-emerald-100 text-emerald-900" : "bg-stone-100 text-stone-700"
                }`}
              >
                {med.taken ? "Taken" : "Mark"}
              </button>
            </div>
          ))}

          <button
            onClick={() => setShowForm((prev) => !prev)}
            className="w-full rounded-lg border border-dashed border-stone-300 bg-white px-3 py-2 text-xs font-semibold text-stone-700"
          >
            {showForm ? "Cancel" : "+ Add medication"}
          </button>

          {showForm && (
            <form onSubmit={submitMedication} className="space-y-2 rounded-xl border border-stone-200 bg-stone-50 p-3">
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Medication name"
                className="w-full rounded-lg border border-stone-300 px-3 py-2 text-xs outline-none focus:border-stone-900"
                required
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  value={dose}
                  onChange={(event) => setDose(event.target.value)}
                  placeholder="Dose (e.g. 90mcg)"
                  className="w-full rounded-lg border border-stone-300 px-3 py-2 text-xs outline-none focus:border-stone-900"
                />
                <input
                  type="time"
                  value={time}
                  onChange={(event) => setTime(event.target.value)}
                  className="w-full rounded-lg border border-stone-300 px-3 py-2 text-xs outline-none focus:border-stone-900"
                />
              </div>
              <select
                value={type}
                onChange={(event) => setType(event.target.value)}
                className="w-full rounded-lg border border-stone-300 px-3 py-2 text-xs outline-none focus:border-stone-900"
              >
                <option>Maintenance inhaler</option>
                <option>Rescue inhaler</option>
                <option>Oral medication</option>
                <option>Nebulizer</option>
              </select>

              <button
                type="submit"
                className="w-full rounded-lg bg-stone-900 px-3 py-2 text-xs font-semibold text-white"
              >
                Save medication
              </button>
            </form>
          )}
        </div>
      </Card>

      <Card title="Medication adherence">
        <p className="text-sm text-stone-700">{adherence}% this week</p>
      </Card>

      <button
        onClick={onExport}
        className="w-full rounded-xl border border-stone-300 bg-white py-3 text-sm font-semibold text-stone-900 transition hover:bg-stone-100"
      >
        Download Doctor PDF Report
      </button>
    </div>
  );
}
