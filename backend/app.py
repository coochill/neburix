from __future__ import annotations
import firebase_admin
from firebase_admin import credentials, firestore
import os
from pathlib import Path
from firebase_config import db

import requests
from flask import Flask, jsonify, request
from flask_cors import CORS

from routes.medication import medication_bp
from services.scheduler import start_scheduler
from routes.settings import settings_bp

def load_waqi_token() -> str:
    env_token = os.getenv("WAQI_TOKEN")
    if env_token:
        return env_token

    token_file = Path(__file__).resolve().parent / "token.txt"
    if not token_file.exists():
        return ""

    for line in token_file.read_text(encoding="utf-8", errors="ignore").splitlines():
        line = line.strip()
        if line.startswith("aqi_token="):
            return line.split("=", 1)[1].strip().strip('"')

    return ""


app = Flask(__name__)
CORS(app)
WAQI_TOKEN = load_waqi_token()

app.register_blueprint(
    medication_bp,
    url_prefix="/api/medications"
)

app.register_blueprint(
    settings_bp,
    url_prefix="/api/settings"
)

@app.get("/api/health")
def health():
    return jsonify({"ok": True, "token_loaded": bool(WAQI_TOKEN)})


@app.get("/api/aqi")
def aqi_proxy():
    city = request.args.get("city", "manila")

    if not WAQI_TOKEN:
        return jsonify({"status": "error", "message": "WAQI token not configured"}), 500

    waqi_url = f"https://api.waqi.info/feed/{city}/?token={WAQI_TOKEN}"

    try:
        response = requests.get(waqi_url, timeout=10)
        response.raise_for_status()
        data = response.json()
        return jsonify(data)
    except requests.RequestException as exc:
        return (
            jsonify(
                {
                    "status": "error",
                    "message": "WAQI proxy request failed",
                    "details": str(exc),
                }
            ),
            502,
        )

@app.post("/api/attack/start")
def start_attack_session():
    try:
        data = request.get_json()

        uid = data.get("uid")
        severity = data.get("severity", "moderate")

        if not uid:
            return jsonify({
                "status": "error",
                "message": "uid is required"
            }), 400

        session_data = {
            "uid": uid,
            "severity": severity,
            "startedAt": firestore.SERVER_TIMESTAMP,
            "checkIns": 0,
            "improved": False,
            "emergency": False
        }

        doc_ref = db.collection("attack_sessions").add(session_data)

        return jsonify({
            "status": "success",
            "message": "Attack session started",
            "sessionId": doc_ref[1].id
        })

    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500



@app.post("/api/attack/check")
def attack_checkin():
    try:
        data = request.get_json()

        session_id = data.get("sessionId")
        improved = data.get("improved")

        if not session_id:
            return jsonify({
                "status": "error",
                "message": "sessionId is required"
            }), 400

        doc_ref = db.collection("attack_sessions").document(session_id)
        doc = doc_ref.get()

        if not doc.exists:
            return jsonify({
                "status": "error",
                "message": "Attack session not found"
            }), 404

        session_data = doc.to_dict()

        current_checkins = session_data.get("checkIns", 0) + 1

        emergency = False

        # Escalation logic
        if improved is False and current_checkins >= 2:
            emergency = True

        doc_ref.update({
            "checkIns": current_checkins,
            "improved": improved,
            "emergency": emergency
        })

        return jsonify({
            "status": "success",
            "checkIns": current_checkins,
            "emergency": emergency,
            "message": (
                "Seek immediate medical attention."
                if emergency
                else "Continue monitoring symptoms."
            )
        })

    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500
    
@app.get("/api/attack/guide")
def get_attack_guide():
    try:
        guide_steps = [
            {
                "step": 1,
                "title": "Sit Upright",
                "instruction": "Sit upright and try to stay calm.",
                "timerSeconds": 30
            },
            {
                "step": 2,
                "title": "Use Rescue Inhaler",
                "instruction": "Take 2 puffs of your rescue inhaler.",
                "timerSeconds": 60
            },
            {
                "step": 3,
                "title": "Wait and Monitor",
                "instruction": "Wait 5 minutes and monitor breathing.",
                "timerSeconds": 300
            },
            {
                "step": 4,
                "title": "Check Symptoms",
                "instruction": "If symptoms are not improving, seek emergency care.",
                "timerSeconds": 0
            }
        ]

        return jsonify({
            "status": "success",
            "guide": guide_steps,
            "emergencyContact": "911",
            "hospitalCTA": True
        })

    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500

@app.post("/api/report/share")
def share_report():
    try:
        data = request.get_json()

        uid = data.get("uid")
        recipient_email = data.get("recipientEmail")
        week_label = data.get("weekLabel")

        if not uid or not recipient_email:
            return jsonify({
                "status": "error",
                "message": "uid and recipientEmail are required"
            }), 400

        report_data = {
            "uid": uid,
            "recipientEmail": recipient_email,
            "weekLabel": week_label,
            "sharedAt": firestore.SERVER_TIMESTAMP
        }

        db.collection("shared_reports").add(report_data)

        return jsonify({
            "status": "success",
            "message": f"Report shared with {recipient_email}"
        })

    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500
    

if __name__ == "__main__":
    start_scheduler()
    app.run(host="0.0.0.0", port=5000, debug=True)
