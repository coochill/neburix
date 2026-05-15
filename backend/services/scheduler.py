from apscheduler.schedulers.background import BackgroundScheduler
from jobs.medication_job import check_medications

scheduler = BackgroundScheduler()

def start_scheduler():
    scheduler.add_job(check_medications, "interval", minutes=1)
    scheduler.start()