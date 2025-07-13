from sqlalchemy.orm import Session
from app.models.job import JobApplication
from app.schemas.job import JobApplicationCreate, JobApplicationUpdate
from typing import List, Optional

def create_job_application(db: Session, job_data: JobApplicationCreate):
    db_job = JobApplication(**job_data.dict())
    db.add(db_job)
    db.commit()
    db.refresh(db_job)
    return db_job

def get_user_applications(db: Session, user_id: str) -> List[JobApplication]:
    return db.query(JobApplication).filter(JobApplication.user_id == user_id).all()

def get_application_by_id(db: Session, application_id: str) -> Optional[JobApplication]:
    return db.query(JobApplication).filter(JobApplication.id == application_id).first()

def update_application(db: Session, application_id: str, job_data: JobApplicationUpdate):
    db_job = get_application_by_id(db, application_id)
    if not db_job:
        return None
    update_data = job_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_job, field, value)
    db.commit()
    db.refresh(db_job)
    return db_job

def delete_application(db: Session, application_id: str) -> bool:
    db_job = get_application_by_id(db, application_id)
    if not db_job:
        return False
    db.delete(db_job)
    db.commit()
    return True 