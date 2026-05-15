from datetime import datetime
import pytz
from firebase_config import db
from services.firebase_messaging import send_notification
from google.cloud.firestore import FieldFilter

ph_tz = pytz.timezone("Asia/Manila")

def check_medications():
    now = datetime.now(ph_tz)
    current_time = now.strftime("%H:%M")
    today = now.strftime("%Y-%m-%d")  

    users_ref = db.collection("users").stream()

    for user_doc in users_ref:
        user_id = user_doc.id

        settings_query = (
            db.collection("user_settings")
            .where(filter=FieldFilter("uid", "==", user_id))
            .limit(1)
            .stream()
        )

        settings_list = list(settings_query)
        settings = settings_list[0].to_dict() if settings_list else {}

        preferences = settings.get("preferences", {})
        med_alerts_enabled = preferences.get("medAlerts", True)

        if not med_alerts_enabled:
            print(f"SKIP {user_id} (medAlerts disabled)")
            continue

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
                    send_notification(
                        token=token,
                        title="Medication Reminder",
                        body=f"Time to take {med['name']} ({med.get('dose', '-')})",
                        data={"medicationId": med_doc.id}
                    )

                med_doc.reference.update({
                    "lastNotifiedDate": today
                })