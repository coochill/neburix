import firebase_admin
from firebase_admin import messaging

def send_medication_notification(token, title, body, data=None):

    message = messaging.Message(
        token=token,

        # DATA PAYLOAD (IMPORTANT FOR WEB)
        data={
            "title": title,
            "body": body,
            **(data or {})
        },

        # WEB PUSH CONFIG
        webpush=messaging.WebpushConfig(
            notification=messaging.WebpushNotification(
                title=title,
                body=body,
                icon="/logo.png",
            )
        )
    )

    response = messaging.send(message)

    print("FCM RESPONSE:", response)

    return response