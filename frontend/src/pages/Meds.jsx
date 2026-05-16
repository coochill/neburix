import { useEffect, useState, useMemo } from "react";
import Card from "../components/Card";
import { Check, Pill, Clock, Trash2 } from "lucide-react";

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

  return (
    <div className="space-y-5">

      <header className="rounded-2xl p-4 text-white shadow-md"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.62 0.11 215), oklch(0.56 0.09 205))",
        }}
      >
        <h2 className="text-2xl font-semibold">Medications</h2>

        <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 text-[11px]">
          <Pill className="h-3 w-3" />
          {adherence}% adherence
        </div>
      </header>

      {/* MORNING */}
      <Card title="Morning">
        {morningMeds.length === 0 && (
          <p className="text-xs text-gray-500">No morning medications</p>
        )}

        {morningMeds.map((med) => (
          <MedItem
            key={med.id}
            med={med}
            onToggle={() => toggleMed(med.parentId)}
            onDelete={() => deleteMed(med.parentId)}
          />
        ))}
      </Card>

      {/* NIGHT */}
      <Card title="Night">
        {nightMeds.length === 0 && (
          <p className="text-xs text-gray-500">No night medications</p>
        )}

        {nightMeds.map((med) => (
          <MedItem
            key={med.id}
            med={med}
            onToggle={() => toggleMed(med.parentId)}
            onDelete={() => deleteMed(med.parentId)}
          />
        ))}
      </Card>

      {/* AS NEEDED */}
      <Card title="As Needed">
        {asNeededMeds.length === 0 && (
          <p className="text-xs text-gray-500">No as-needed medications</p>
        )}

        {asNeededMeds.map((med) => (
          <MedItem
            key={med.id}
            med={med}
            onToggle={() => toggleMed(med.parentId)}
            onDelete={() => deleteMed(med.parentId)}
          />
        ))}
      </Card>

      {/* FORM */}
      <button
        onClick={() => setShowForm((p) => !p)}
        className="w-full rounded-2xl py-3 text-sm text-white"
        style={{
          background: showForm
            ? "#aaa"
            : "linear-gradient(135deg, oklch(0.62 0.11 220), oklch(0.56 0.09 200))",
        }}
      >
        {showForm ? "Cancel" : "Add medication"}
      </button>

      {showForm && (
        <form onSubmit={submitMedication} className="space-y-4 rounded-2xl border bg-stone-50 p-4">

          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Medication name"
            className="w-full rounded-xl border px-3 py-2 text-sm"
            required
          />

          <div className="grid grid-cols-2 gap-2">
            <input
              value={dose}
              onChange={(e) => setDose(e.target.value)}
              placeholder="Dose"
              className="rounded-xl border px-3 py-2 text-sm"
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

          <div className="flex gap-2">
            <button type="button" onClick={() => setScheduleType("scheduled")}
              className="rounded-xl px-3 py-2 text-sm text-white"
              style={{
                background: scheduleType === "scheduled"
                  ? "linear-gradient(135deg, oklch(0.62 0.11 220), oklch(0.56 0.09 200))"
                  : "#e7e5e4",
                color: scheduleType === "scheduled" ? "white" : "#333",
              }}>
              Scheduled
            </button>

            <button type="button" onClick={() => setScheduleType("as_needed")}
              className="rounded-xl px-3 py-2 text-sm"
              style={{
                background: scheduleType === "as_needed"
                  ? "linear-gradient(135deg, oklch(0.62 0.11 220), oklch(0.56 0.09 200))"
                  : "#e7e5e4",
                color: scheduleType === "as_needed" ? "white" : "#333",
              }}>
              As Needed
            </button>
          </div>

          {scheduleType === "scheduled" && (
            <div>
              <button
                type="button"
                onClick={() => setTimes((p) => [...p, ""])}
                className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm text-white"
                style={{
                  background: "linear-gradient(135deg, oklch(0.62 0.11 220), oklch(0.56 0.09 200))",
                }}
              >
                <span className="text-base leading-none">+</span>
                Add time
              </button>

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
                  className="w-full rounded-xl border px-3 py-2 text-sm"
                />
              ))}
            </div>
          )}

          <button
            type="submit"
            className="w-full rounded-xl py-2 text-white"
            style={{ backgroundColor: PRIMARY }}
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
        className="w-full rounded-2xl py-3 text-white"
        style={{
          background: `linear-gradient(135deg, ${PRIMARY}, oklch(0.52 0.1 200))`,
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
    <div className="flex items-center justify-between rounded-xl border bg-white p-3">
      <div>
        <p className="font-semibold">
          {med.name} — {med.dose}
        </p>

        <p className="text-xs text-gray-500 flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {med.type}
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
          className="rounded-full px-3 py-1 text-xs text-red-600 hover:bg-red-50"
        >
          <Trash2 className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}