from datetime import datetime
import pytz
from firebase_config import db
from services.firebase_messaging import send_medication_notification

ph_tz = pytz.timezone("Asia/Manila")

def check_medications():
    now = datetime.now(ph_tz)
    current_time = now.strftime("%H:%M")
    today = now.strftime("%Y-%m-%d")  

    users_ref = db.collection("users").stream()

    for user_doc in users_ref:
        user_id = user_doc.id

        meds_ref = db.collection("users").document(user_id).collection("medication")
        meds = meds_ref.stream()

        for med_doc in meds:
            med = med_doc.to_dict()

            if (
                med.get("time") == current_time
                and not med.get("taken", False)
                and med.get("lastNotifiedDate") != today
            ):

                user_data = user_doc.to_dict()
                tokens = user_data.get("fcmTokens", [])

                for token in tokens:
                    send_medication_notification(
                        token=token,
                        title="Medication Reminder",
                        body=f"Time to take {med['name']} ({med.get('dose', '-')})",
                        data={"medicationId": med_doc.id}
                    )

                med_doc.reference.update({
                    "lastNotifiedDate": today
                })