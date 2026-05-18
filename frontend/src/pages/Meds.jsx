import { useEffect, useState, useMemo } from "react";
import Card from "../components/Card";
import { Check, Pill, Clock, Trash2, Sun, Moon, AlertTriangle, Plus} from "lucide-react";

const PRIMARY = "oklch(0.6 0.118 184.704)";

export default function Meds({ userId, onExport }) {
  const [medsList, setMedsList] = useState([]);
  const [showForm, setShowForm] = useState(false);

  const [scheduleType, setScheduleType] = useState("");

  const [name, setName] = useState("");
  const [dose, setDose] = useState("");
  const [times, setTimes] = useState([]);
  const [type, setType] = useState("Maintenance inhaler");

  useEffect(() => {
    fetchMeds();
  }, []);

  async function fetchMeds() {
    try {
      const res = await fetch(
        `http://localhost:5000/api/medications/${userId}`
      );

      const data = await res.json();
      setMedsList(data.data || []);
    } catch (err) {
      console.error("Failed to fetch meds:", err);
    }
  }

  async function submitMedication(e) {
    e.preventDefault();
    if (!name.trim()) return;

    await fetch(`http://localhost:5000/api/medications/${userId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: name.trim(),
        dose: dose.trim() || "-",
        type,
        scheduleType,
        times: scheduleType === "scheduled" ? times : [],
      }),
    });

    resetForm();
    setShowForm(false);
    fetchMeds();
  }

  async function toggleMed(id) {
    try {
      // optimistic UI update FIRST (instant feedback)
      setMedsList((prev) =>
        prev.map((m) =>
          m.id === id ? { ...m, taken: !m.taken } : m
        )
      );

      // then backend sync
      await fetch(
        `http://localhost:5000/api/medications/${userId}/${id}/toggle`,
        { method: "PATCH" }
      );

    } catch (err) {
      console.error("Toggle failed:", err);

      // rollback if failed
      fetchMeds();
    }
  }

  async function deleteMed(id) {
    await fetch(
      `http://localhost:5000/api/medications/${userId}/${id}`,
      { method: "DELETE" }
    );

    fetchMeds();
  }

  function resetForm() {
    setName("");
    setDose("");
    setTimes([]);
    setType("Maintenance inhaler");
    setScheduleType("");
  }

  function getTimeSlot(timeStr) {
    if (!timeStr) return "";

    const hour = parseInt(timeStr.split(":")[0], 10);
    if (Number.isNaN(hour)) return "";

    return hour < 12 ? "morning" : "night";
  }

  // FLATTEN MEDS (SAFE VERSION)
  const doseItems = useMemo(() => {
    const items = [];

    medsList.forEach((med) => {
      const list =
        med.scheduleType === "as_needed"
          ? [""]
          : med.time
          ? [med.time]
          : med.times?.length
          ? med.times
          : [];

      list.forEach((t, idx) => {
        items.push({
          id: `${med.id}-${idx}`,
          parentId: med.id,
          name: med.name,
          dose: med.dose,
          type: med.type,
          time: t,
          slot:
            med.scheduleType === "as_needed"
              ? "as_needed"
              : getTimeSlot(t),
          taken: med.taken,
        });
      });
    });

    return items;
  }, [medsList]);

  const morningMeds = doseItems.filter((d) => d.slot === "morning");
  const nightMeds = doseItems.filter((d) => d.slot === "night");
  const asNeededMeds = doseItems.filter((d) => d.slot === "as_needed");

  const taken = medsList.filter((m) => m.taken).length;
  const adherence = medsList.length
    ? Math.round((taken / medsList.length) * 100)
    : 0;
function MedItem({ med, onToggle, onDelete }) {
  return (
    <div className="flex items-center justify-between rounded-xl border p-2 bg-white/60 backdrop-blur">

      {/* Left side (med info) */}
      <div className="text-sm">
        {med.name}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">

        {/* CHECK BUTTON */}
        <button
          onClick={onToggle}
          className="p-1 rounded-lg transition-all duration-200 hover:shadow-md hover:scale-110 active:scale-95"
        >
          <Check className="h-4 w-4 text-green-600" />
        </button>

        {/* DELETE BUTTON */}
        <button
          onClick={onDelete}
          className="p-1 rounded-lg text-red-500 transition-all duration-200 hover:shadow-md hover:scale-110 active:scale-95"
        >
          <Trash2 className="h-4 w-4" />
        </button>

      </div>
    </div>
  );
}
  return (
    <div className="space-y-5">

 <header
  className="relative overflow-hidden rounded-2xl p-5 text-white shadow-md"
  style={{
    background:
      "linear-gradient(135deg, oklch(0.62 0.11 215), oklch(0.56 0.09 205))",
  }}
>
  {/* Background glow */}
  <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-white/10 blur-2xl" />

  <div className="relative flex items-center justify-between">

    {/* LEFT CONTENT */}
    <div>
      <h2 className="text-2xl font-semibold">
        Medications
      </h2>

      <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 text-[11px]">
        <Pill className="h-3 w-3" />
        {adherence}% adherence
      </div>
    </div>

    {/* MEDS ICON */}
    <div className="rounded-xl bg-white/15 p-2.5 backdrop-blur">
      <Pill className="h-5 w-5 text-white" />
    </div>

  </div>
</header>
      
      
      <div className="rounded-2xl border bg-white shadow-sm overflow-hidden divide-y divide-stone-100 px-4 pt-4">

        {/* MORNING */}
        <div className="pb-4">
          <p className="text-sm font-bold mb-3" style={{ color: "oklch(0.62 0.11 220)" }}>
            <div className="flex items-start gap-1">

  {/* Icon */}
  <div className="flex items-center justify-center w-5 h-5">
            <Sun
              className="h-5 w-5"
              style={{ color: "oklch(0.56 0.09 200)" }}
            />
          </div>
          <div>
          <p>Morning</p>
          </div>
          </div>
          </p>
          {morningMeds.length === 0 && <p className="text-xs text-gray-400">No morning medications</p>}
          <div className="space-y-2">
            {morningMeds.map((med) => (
              <MedItem
                key={med.id}
                med={med}
                onToggle={() => toggleMed(med.parentId)}
                onDelete={() => deleteMed(med.parentId)}
              />
            ))}
          </div>
        </div>

        {/* NIGHT */}
        <div className="py-4">
          <p className="text-sm font-bold mb-3" style={{ color: "oklch(0.62 0.11 220)" }}>           <div className="flex items-start gap-1">

  {/* Icon */}
  <div className="flex items-center justify-center w-5 h-5">
            <Moon
              className="h-5 w-5"
              style={{ color: "oklch(0.56 0.09 200)" }}
            />
          </div>
          <div>
          <p>Night</p>
          </div>
          </div>
          </p>
          {nightMeds.length === 0 && <p className="text-xs text-gray-400">No night medications</p>}
          <div className="space-y-2">
            {nightMeds.map((med) => (
              <MedItem
                key={med.id}
                med={med}
                onToggle={() => toggleMed(med.parentId)}
                onDelete={() => deleteMed(med.parentId)}
              />
            ))}
          </div>
        </div>

        {/* AS NEEDED */}
        <div className="py-4">
          <p className="text-sm font-bold mb-3" style={{ color: "oklch(0.62 0.11 220)" }}>        
               <div className="flex items-start gap-1">

  {/* Icon */}
  <div className="flex items-center justify-center w-5 h-5">
            <AlertTriangle
              className="h-5 w-5"
              style={{ color: "oklch(0.56 0.09 200)" }}
            />
          </div>
          <div>
          <p>As Needed</p>
          </div>
          </div>
          </p>
          {asNeededMeds.length === 0 && <p className="text-xs text-gray-400">No as-needed medications</p>}
          <div className="space-y-2">
            {asNeededMeds.map((med) => (
              <MedItem
                key={med.id}
                med={med}
                onToggle={() => toggleMed(med.parentId)}
                onDelete={() => deleteMed(med.parentId)}
              />
            ))}
          </div>
        </div>

        {/* ADD BUTTON */}
        <div className="py-4">
          <button
  onClick={() => setShowForm((p) => !p)}
  className="mt-3 w-full rounded-xl px-4 py-2 text-white shadow-md transition-all duration-300 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
  style={{
    background: showForm ? "#9ca3af" : "#2563eb", // gray when open, blue when closed
  }}
>
  {showForm ? "Cancel" : "Add medication"}
</button>
        </div>

      </div>

   
      {showForm && (
        <form onSubmit={submitMedication} className="space-y-3 rounded-2xl border bg-white shadow-sm p-4">

                        <div className="flex items-start gap-1">

  {/* Icon */}
  <div className="flex items-center justify-center w-5 h-5">
            <Plus
              className="h-5 w-5"
              style={{ color: "oklch(0.56 0.09 200)" }}
            />
          </div>
          <div>
         <p className="text-sm font-bold" style={{ color: "oklch(0.62 0.11 220)" }}>
            New Medication
          </p>
</div>
</div>
          {/* NAME */}
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Medication name"
            className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2.5 text-sm placeholder:text-gray-400 focus:outline-none"
            required
          />

          <div className="grid grid-cols-2 gap-2">
            <input
              value={dose}
              onChange={(e) => setDose(e.target.value)}
              placeholder="Dose"
              className="rounded-xl border border-stone-200 bg-stone-50 px-3 py-2.5 text-sm placeholder:text-gray-400 focus:outline-none"
            />

            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
               className="rounded-xl border px-3 py-2 text-sm"
          >
            <option style={{ background: type === "Maintenance inhaler" ? "oklch(0.62 0.11 220)" : "white", color: type === "Maintenance inhaler" ? "white" : "#333" }}>Maintenance inhaler</option>
            <option style={{ background: type === "Rescue inhaler" ? "oklch(0.62 0.11 220)" : "white", color: type === "Rescue inhaler" ? "white" : "#333" }}>Rescue inhaler</option>
            <option style={{ background: type === "Oral medication" ? "oklch(0.62 0.11 220)" : "white", color: type === "Oral medication" ? "white" : "#333" }}>Oral medication</option>
            <option style={{ background: type === "Nebulizer" ? "oklch(0.62 0.11 220)" : "white", color: type === "Nebulizer" ? "white" : "#333" }}>Nebulizer</option>
          </select>
          </div>

          <div>
            <p className="text-xs text-gray-400 mb-2">Schedule</p>
            <div className="flex gap-2">
              <button type="button" onClick={() => setScheduleType("scheduled")}
                className="flex-1 rounded-xl py-2 text-sm font-medium transition-all duration-300 hover:shadow-md hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  background: scheduleType === "scheduled"
                    ? "linear-gradient(135deg, oklch(0.62 0.11 220), oklch(0.56 0.09 200))"
                    : "#f5f5f4",
                  color: scheduleType === "scheduled" ? "white" : "#555",
                }}>
                Scheduled
              </button>
              <button
                type="button"
                onClick={() => setScheduleType("as_needed")}
                className="flex-1 rounded-xl py-2 text-sm font-medium transition-all duration-300 hover:shadow-md hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  background: scheduleType === "as_needed"
                    ? "linear-gradient(135deg, oklch(0.62 0.11 220), oklch(0.56 0.09 200))"
                    : "#f5f5f4",
                  color: scheduleType === "as_needed" ? "white" : "#555",
                }}
              >
                As Needed
              </button>
            </div>
          </div>

          {/* TIME PICKER */}
          {scheduleType === "scheduled" && (
            <div className="space-y-2">
              <p className="text-xs text-gray-400">Times</p>
              {times.map((t, i) => (
                <input
                  key={i}
                  type="time"
                  value={t}
                  onChange={(e) => {
                    const copy = [...times];
                    copy[i] = e.target.value;
                    setTimes(copy);
                  }}
                  className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2.5 text-sm focus:outline-none"
                />
              ))}
              <button
                type="button"
                onClick={() => setTimes((p) => [...p, ""])}
                 className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-xl transition-all duration-300 hover:shadow-md hover:scale-[1.03] active:scale-[0.97]"
  style={{ color: "oklch(0.62 0.11 220)", background: "oklch(0.94 0.03 220)" }}
              >
                <span className="text-base leading-none">+</span> Add time
              </button>
            </div>
          )}

          <button
            type="submit"
            className="mt-5 w-full rounded-2xl py-3 text-sm font-semibold text-white shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
        style={{ background: "linear-gradient(135deg, oklch(0.62 0.11 220), oklch(0.56 0.09 200))" }}
      >
            Save medication
          </button>
        </form>
      )}

      <Card title="Adherence">
        <p className="text-sm">{adherence}% adherence this week</p>
      </Card>

      <button
        onClick={onExport}
       className="mt-5 w-[95%] block mx-auto rounded-2xl py-3 text-sm font-semibold text-white shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
  style={{
    background:
      "linear-gradient(135deg, oklch(0.62 0.11 220), oklch(0.56 0.09 200))",
  }}
>
        Download Doctor PDF Report
      </button>
    </div>
  );
}

/* ITEM */
function MedItem({ med, onToggle, onDelete }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-stone-100 bg-stone-50 p-3 gap-3">

      <div className="flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center"
        style={{ background: "oklch(0.92 0.04 220)" }}>
        <Pill className="h-4 w-4" style={{ color: "oklch(0.62 0.11 220)" }} />
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm text-gray-800 truncate">
          {med.name} — {med.dose}
        </p>
        <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
          <Clock className="h-3 w-3" />
          {med.type}{med.time ? ` · ${med.time}` : ""}
        </p>
      </div>

      <div className="flex gap-2">
        <button
          onClick={onToggle}
          className="rounded-full px-3 py-1 text-xs"
          style={{
            backgroundColor: med.taken ? PRIMARY : "#eee",
            color: med.taken ? "white" : "#333",
          }}
        >
          <Check className="h-3 w-3" />
        </button>

        <button
          onClick={onDelete}
          className="rounded-full p-1.5 text-red-400 hover:bg-red-50 transition-all"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}