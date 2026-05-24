import { useEffect, useState, useRef } from "react";
import "./AttackGuidance.css";
import { t } from "../lib/i18n";
import HospitalMap from "./HospitalMap";

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

  const emergencyRef = useRef(null);
  const [showMap, setShowMap] = useState(false);

  useEffect(() => {
    if (emergency && emergencyRef.current) {
      emergencyRef.current.focus();
    }
  }, [emergency]);

  return (
      <div className="ag-card" role="region" aria-labelledby="ag-title">
        {/* Icon */}
        <div className="ag-icon-wrap">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>

        {/* Title */}
        <h2 id="ag-title" className="ag-title">{t("title")}</h2>
        <div className="ag-divider" />
        <p className="ag-subtitle">{t("subtitle")}</p>

        {/* Start button */}
        {!sessionId && (
          <button
            onClick={startAttackFlow}
            disabled={loading}
            className="ag-btn-primary"
            aria-label={loading ? t("starting") : t("start")}
          >
            {loading ? t("starting") : t("start")}
          </button>
        )}

        {/* Steps */}
        {!!guide.length && (
          <div className="ag-steps">
            {guide.map((step) => (
              <div key={step.step} className="ag-step-card">
                <div className="ag-step-number">{step.step}</div>
                <div>
                  <p className="ag-step-title">{step.title}</p>
                  <p className="ag-step-instruction">{step.instruction}</p>
                  <span className="ag-step-timer">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                    </svg>
                    {step.timerSeconds}{t("timerSuffix")}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Check buttons */}
        {sessionId && (
          <div className="ag-check-row">
            <button
              onClick={() => handleCheck(true)}
              className="ag-btn-improving"
              aria-label={t("improving")}
            >
              ✓ {t("improving")}
            </button>
            <button
              onClick={() => handleCheck(false)}
              className="ag-btn-not-improving"
              aria-label={t("notImproving")}
            >
              ✗ {t("notImproving")}
            </button>
          </div>
        )}

        {/* Status message */}
        {message && (
          <p className="ag-message" aria-live="polite">{message}</p>
        )}

        {/* Emergency block */}
        {emergency && (
          <div
            className="ag-emergency-box"
            role="alert"
            tabIndex={-1}
            ref={emergencyRef}
          >
            <p className="ag-emergency-title">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
              {t("emergencyTitle")}
            </p>
            <div className="ag-emergency-actions">
              <a href="tel:911" className="ag-call-btn">
                 {t("callEmergency")}
              </a>

              <a
                href="https://www.google.com/maps/search/hospital+near+me"
                target="_blank"
                rel="noreferrer"
                className="ag-hospital-btn"
              >
                 {t("findHospital")}
              </a>
            </div>
          </div>
        )}

        {showMap && (
          <div style={{ marginTop: 12 }}>
            <HospitalMap />
          </div>
        )}
      </div>
  );
}

export default AttackGuidance;