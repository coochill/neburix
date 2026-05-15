import { useEffect, useState } from "react";

function AttackGuidance({ user }) {
  const [guide, setGuide] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [message, setMessage] = useState("");
  const [emergency, setEmergency] = useState(false);

  async function startAttackFlow() {
    setLoading(true);

    try {
      // Fetch guide steps
      const guideRes = await fetch("http://127.0.0.1:5000/api/attack/guide");
      const guideData = await guideRes.json();

      setGuide(guideData.guide || []);

      // Create attack session
      const startRes = await fetch("http://127.0.0.1:5000/api/attack/start", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          uid: user.uid,
          severity: "high",
        }),
      });

      const startData = await startRes.json();

      setSessionId(startData.sessionId);

    } catch (error) {
      console.error(error);
      setMessage("Failed to start attack guidance.");
    }

    setLoading(false);
  }

  async function handleCheck(improved) {
    try {
      const response = await fetch("http://127.0.0.1:5000/api/attack/check", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionId,
          improved,
        }),
      });

      const data = await response.json();

      setMessage(data.message);

      if (data.emergency) {
        setEmergency(true);
      }

    } catch (error) {
      console.error(error);
    }
  }

  return (
    <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
      <h2 className="text-lg font-bold text-red-700">
        Asthma Attack Guidance
      </h2>

      {!sessionId && (
        <button
          onClick={startAttackFlow}
          disabled={loading}
          className="mt-4 rounded-xl bg-red-600 px-4 py-2 text-white"
        >
          {loading ? "Starting..." : "Start Emergency Guidance"}
        </button>
      )}

      {!!guide.length && (
        <div className="mt-4 space-y-4">
          {guide.map((step) => (
            <div
              key={step.step}
              className="rounded-xl border border-red-100 bg-white p-3"
            >
              <p className="font-semibold">
                Step {step.step}: {step.title}
              </p>

              <p className="text-sm text-stone-600">
                {step.instruction}
              </p>

              <p className="mt-1 text-xs text-stone-500">
                Timer: {step.timerSeconds} seconds
              </p>
            </div>
          ))}
        </div>
      )}

      {sessionId && (
        <div className="mt-4 flex gap-2">
          <button
            onClick={() => handleCheck(true)}
            className="rounded-xl bg-green-600 px-4 py-2 text-white"
          >
            Improving
          </button>

          <button
            onClick={() => handleCheck(false)}
            className="rounded-xl bg-red-600 px-4 py-2 text-white"
          >
            Not Improving
          </button>
        </div>
      )}

      {message && (
        <p className="mt-4 text-sm font-medium text-stone-700">
          {message}
        </p>
      )}

      {emergency && (
        <div className="mt-4 rounded-xl border border-red-400 bg-white p-4">
          <p className="font-bold text-red-700">
            Emergency Assistance Needed
          </p>

          <div className="mt-3 flex flex-col gap-2">
            <a
              href="tel:911"
              className="rounded-xl bg-red-700 px-4 py-2 text-center text-white"
            >
              Call Emergency Services
            </a>

            <a
              href="https://www.google.com/maps/search/hospital+near+me"
              target="_blank"
              rel="noreferrer"
              className="rounded-xl border border-red-300 px-4 py-2 text-center"
            >
              Find Nearest Hospital
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

export default AttackGuidance;