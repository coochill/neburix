from flask import Blueprint, request
from firebase_config import db
from utils.response import success, error

settings_bp = Blueprint("settings", __name__)

DEFAULT_SETTINGS = {
    "aqi_mild": 51,
    "aqi_moderate": 101,
    "aqi_severe": 151,
}

@settings_bp.route("/<user_id>", methods=["GET"])
def get_settings(user_id):

    ref = db.collection("user_settings").document(user_id)
    doc = ref.get()

    if not doc.exists:
        return success("Settings fetched", {
            **DEFAULT_SETTINGS,
            "uid": user_id
        })

    data = doc.to_dict()

    merged = {**DEFAULT_SETTINGS, **data}

    return success("Settings fetched", merged)

@settings_bp.route("/<user_id>", methods=["PATCH"])
def update_settings(user_id):

    data = request.json

    if not data:
        return error("No data provided")

    mild = data.get("aqi_mild", 51)
    moderate = data.get("aqi_moderate", 101)
    severe = data.get("aqi_severe", 151)

    if not (mild < moderate < severe):
        return error("Invalid AQI thresholds: must be mild < moderate < severe")

    ref = db.collection("user_settings").document(user_id)

    payload = {
        **DEFAULT_SETTINGS,
        **data
    }

    ref.set(payload, merge=True)

    return success("Settings updated", payload)