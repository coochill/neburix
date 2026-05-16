from datetime import datetime, timedelta
import pytz
from firebase_config import db
from firebase_admin import firestore
from services.firebase_messaging import send_notification

ph_tz = pytz.timezone("Asia/Manila")

def check_missed_meds():
    now = datetime.now(ph_tz)
    today = now.strftime("%Y-%m-%d")

    users = db.collection("users").stream()

    for user in users:
        user_data = user.to_dict()
        tokens = user_data.get("fcmTokens", [])

        meds = db.collection("users").document(user.id).collection("medication").stream()

        for med in meds:
            data = med.to_dict()

            if data.get("scheduleType") != "scheduled":
                continue

            if data.get("taken") is True:
                continue

            med_time = data.get("time")
            if not med_time:
                continue

            med_datetime = datetime.strptime(med_time, "%H:%M")
            med_datetime = ph_tz.localize(
                med_datetime.replace(
                    year=now.year,
                    month=now.month,
                    day=now.day
                )
            )

            # prevent spam per day
            if data.get("lastMissedNotifiedDate") == today:
                continue

            if now >= med_datetime + timedelta(minutes=30):

                # log missed dose
                db.collection("missed_doses").add({
                    "uid": user.id,
                    "medication": data["name"],
                    "scheduledTime": med_time,
                    "missed": True,
                    "createdAt": firestore.SERVER_TIMESTAMP
                })

                # send notification
                for token in tokens:
                    try:
                        send_notification(
                            token=token,
                            title="Missed Medication",
                            body=f"You missed your {data['name']} dose.",
                            data={
                                "type": "missed_dose",
                                "title": "Missed Medication",
                                "body": f"You missed your {data['name']} dose.",
                                "medicationId": med.id,
                                "userId": user.id,
                                "medication": data["name"],
                            }
                        )
                    except Exception as e:
                        print("FCM ERROR (missed dose):", e)

                med.reference.update({
                    "lastMissedNotifiedDate": today
                })