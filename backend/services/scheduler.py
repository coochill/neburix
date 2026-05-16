from apscheduler.schedulers.background import BackgroundScheduler
from jobs.medication_job import check_medications
from jobs.aqi_job import check_aqi_alerts
from jobs.missed_doses_job import check_missed_meds

scheduler = BackgroundScheduler()

def start_scheduler():

    scheduler.add_job(
        check_medications,
        "interval",
        minutes=1
    )

    scheduler.add_job(
        check_aqi_alerts,
        "interval",
        minutes=1
    )

    scheduler.add_job(
        check_missed_meds,
        "interval",
        minutes=1
    )

    scheduler.start()
