from __future__ import annotations

import os
from pathlib import Path

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


if __name__ == "__main__":
    start_scheduler()
    app.run(host="0.0.0.0", port=5000, debug=True)
