from flask import Blueprint, request

from services.medication_service import (
    get_medications,
    add_medication,
    toggle_medication,
    delete_medication
)

from utils.response import success, error

medication_bp = Blueprint("medication", __name__)


@medication_bp.route("/<user_id>", methods=["GET"])
def fetch_medications(user_id):
    meds = get_medications(user_id)

    return success("Medications fetched", meds)


@medication_bp.route("/<user_id>", methods=["POST"])
def create_medication(user_id):
    data = request.json

    required_fields = ["name", "dose", "type", "scheduleType"]

    for field in required_fields:
        if field not in data:
            return error(f"{field} is required")

    med_id = add_medication(user_id, data)

    return success("Medication added", {
        "id": med_id
    })


@medication_bp.route("/<user_id>/<medication_id>/toggle", methods=["PATCH"])
def toggle(user_id, medication_id):
    updated = toggle_medication(user_id, medication_id)

    if not updated:
        return error("Medication not found", 404)

    return success("Medication updated")


@medication_bp.route("/<user_id>/<medication_id>", methods=["DELETE"])
def delete(user_id, medication_id):
    delete_medication(user_id, medication_id)

    return success("Medication deleted")