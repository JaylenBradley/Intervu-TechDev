from sqlalchemy.orm import Session
<<<<<<< HEAD
from app.models.job import JobApplication
from app.schemas.job import JobApplicationCreate, JobApplicationUpdate
from typing import List, Optional

def create_job_application(db: Session, job_data: JobApplicationCreate):
    db_job = JobApplication(**job_data.dict())
=======
from app.models.job import JobApplication, ApplicationStatus
from app.schemas.job import JobApplicationCreate, JobApplicationUpdate
from typing import List, Optional
import uuid

def create_job_application(db: Session, job_data: JobApplicationCreate):
    # Generate a unique ID for the job application
    job_dict = job_data.dict()
    job_dict['id'] = str(uuid.uuid4())
    
    # Convert Pydantic enum to SQLAlchemy enum
    if 'status' in job_dict and job_dict['status']:
        job_dict['status'] = ApplicationStatus(job_dict['status'].value)
    
    db_job = JobApplication(**job_dict)
>>>>>>> justin/dev
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
<<<<<<< HEAD
    update_data = job_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_job, field, value)
=======
    
    update_data = job_data.dict(exclude_unset=True)
    
    # Convert Pydantic enum to SQLAlchemy enum if status is being updated
    if 'status' in update_data and update_data['status']:
        update_data['status'] = ApplicationStatus(update_data['status'].value)
    
    for field, value in update_data.items():
        setattr(db_job, field, value)
    
>>>>>>> justin/dev
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