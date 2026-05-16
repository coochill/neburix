from firebase_config import db

def get_medications(user_id):
    meds_ref = db.collection("users").document(user_id).collection("medication")

    meds = []

    for doc in meds_ref.stream():
        med = doc.to_dict()
        med["id"] = doc.id
        meds.append(med)

    return meds


def add_medication(user_id, medication_data):
    meds_ref = db.collection("users").document(user_id).collection("medication")

    schedule_type = medication_data.get("scheduleType")
    times = medication_data.get("times") or []

    created_ids = []

    if schedule_type == "scheduled":
        if not times:
            return [] 

        for t in times:
            new_doc = meds_ref.document()

            new_doc.set({
                "name": medication_data["name"],
                "dose": medication_data.get("dose", "-"),
                "type": medication_data["type"],
                "scheduleType": schedule_type,
                "time": t,
                "taken": False
            })

            created_ids.append(new_doc.id)

    else:
        new_doc = meds_ref.document()

        new_doc.set({
            "name": medication_data["name"],
            "dose": medication_data.get("dose", "-"),
            "type": medication_data["type"],
            "scheduleType": schedule_type,
            "time": None,  
            "taken": False
        })

        created_ids.append(new_doc.id)

    return created_ids


def toggle_medication(user_id, medication_id):
    med_ref = (
        db.collection("users")
        .document(user_id)
        .collection("medication")
        .document(medication_id)
    )

    med = med_ref.get()

    if not med.exists:
        return False

    current = med.to_dict().get("taken", False)

    med_ref.update({
        "taken": not current
    })

    return True


def delete_medication(user_id, medication_id):
    med_ref = (
        db.collection("users")
        .document(user_id)
        .collection("medication")
        .document(medication_id)
    )

    med_ref.delete()

    return True