import firebase_admin
from firebase_admin import messaging

def send_notification(token, title, body, data=None):

    message = messaging.Message(
        token=token,

        data={
            "title": str(title),
            "body": str(body),
            "type": "medication",
            **({k: str(v) for k, v in (data or {}).items()})
        }
    )

    return messaging.send(message)