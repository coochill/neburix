from apscheduler.schedulers.background import BackgroundScheduler
from jobs.medication_job import check_medications
from jobs.aqi_job import check_aqi_alerts

scheduler = BackgroundScheduler()

def start_scheduler():

    scheduler.add_job(
        check_medications,
        "interval",
        minutes=59
    )

    scheduler.add_job(
        check_aqi_alerts,
        "interval",
        minutes=59
    )

    scheduler.start()
