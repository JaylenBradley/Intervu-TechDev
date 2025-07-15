# backend/app/api/jobs.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.database import SessionLocal
from app.schemas.job import JobApplicationCreate, JobApplicationUpdate, JobApplicationResponse
from app.crud.job import (
    create_job_application,
    get_user_applications,
    get_application_by_id,
    update_application,
    delete_application
)

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/jobs", response_model=JobApplicationResponse)
def create_application(job_data: JobApplicationCreate, db: Session = Depends(get_db)):
    return create_job_application(db, job_data)

@router.get("/jobs/application/{application_id}", response_model=JobApplicationResponse)
def get_application(application_id: str, db: Session = Depends(get_db)):
    application = get_application_by_id(db, application_id)
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
    return application

@router.patch("/jobs/{application_id}", response_model=JobApplicationResponse)
def patch_application_endpoint(application_id: str, job_data: JobApplicationUpdate, db: Session = Depends(get_db)):
    updated_job = update_application(db, application_id, job_data)
    if not updated_job:
        raise HTTPException(status_code=404, detail="Application not found")
    return updated_job

@router.delete("/jobs/{application_id}")
def delete_application_endpoint(application_id: str, db: Session = Depends(get_db)):
    success = delete_application(db, application_id)
    if not success:
        raise HTTPException(status_code=404, detail="Application not found")
    return {"message": "Application deleted successfully"}

@router.get("/jobs/{user_id}", response_model=List[JobApplicationResponse])
def get_applications(user_id: str, db: Session = Depends(get_db)):
    return get_user_applications(db, user_id)