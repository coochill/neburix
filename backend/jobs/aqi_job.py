import requests
from datetime import datetime

from firebase_config import db
from services.firebase_messaging import send_notification
from google.cloud.firestore import FieldFilter


def get_aqi_from_api(location="geo:13.7566;121.0582"):
    try:
        response = requests.get(
            f"http://localhost:5000/api/aqi?city={location}",
            timeout=10
        )

        data = response.json()

        if data.get("status") != "ok":
            return None

        payload = data.get("data", {})

        aqi = payload.get("aqi")

        if aqi not in [None, "-"]:
            return int(aqi)

        pm25 = payload.get("iaqi", {}).get("pm25", {}).get("v")

        if pm25 is not None:
            return int(pm25)

        return None

    except Exception:
        return None


def get_severity(aqi, settings):
    if aqi >= settings.get("aqi_severe", 151):
        return "Severe"
    if aqi >= settings.get("aqi_moderate", 101):
        return "Moderate"
    if aqi >= settings.get("aqi_mild", 51):
        return "Mild"
    return None

def get_as_needed_medications(user_id):
    meds_ref = (
        db.collection("users")
        .document(user_id)
        .collection("medication")
    )

    meds = meds_ref.where(
        filter=FieldFilter("scheduleType", "==", "as_needed")
    ).stream()

    result = []

    for m in meds:
        data = m.to_dict()

        result.append({
            "id": m.id,
            "name": data.get("name"),
            "type": data.get("type"),
            "dose": data.get("dose"),
            "taken": data.get("taken", False),
        })

    return result


def check_aqi_alerts():
    print("CHECKING AQI ALERTS...")

    current_aqi = get_aqi_from_api("geo:13.7566;121.0582")

    if current_aqi is None:
        print("AQI FETCH FAILED")
        return

    users = db.collection("users").stream()

    for user_doc in users:
        user_id = user_doc.id
        user_data = user_doc.to_dict()

        tokens = user_data.get("fcmTokens", [])

        settings_ref = (
            db.collection("user_settings")
            .document(user_id)
        )

        settings_doc = settings_ref.get()
        settings = settings_doc.to_dict() if settings_doc.exists else {}

        preferences = settings.get("preferences", {})
        if not preferences.get("aqiAlerts", True):
            print(f"SKIP {user_id} (AQI alerts disabled)")
            continue

        severity = get_severity(current_aqi, settings)

        if not severity:
            continue

        # AQI comparison
        last_aqi = settings.get("lastAqiAlertValue")

        if last_aqi == current_aqi:
            print(f"SKIP {user_id} (same AQI: {current_aqi})")
            continue

        meds = get_as_needed_medications(user_id)
        medication_text = ", ".join([m["name"] for m in meds]) if meds else "No as-needed meds"

        for token in tokens:
            try:
                send_notification(
                    token=token,
                    title="AQI Alert",
                    body=f"AQI {current_aqi} ({severity}). You may need: {medication_text}",
                    data={
                        "type": "aqi_alert",
                        "aqi": str(current_aqi),
                        "severity": str(severity),
                        "medications": medication_text
                    }
                )

            except Exception as e:
                print("FCM ERROR:", e)

        settings_ref.set(
            {
                "lastAqiAlertValue": current_aqi,
                "lastAqiAlertDate": datetime.now().strftime("%Y-%m-%d")
            },
            merge=True
        )