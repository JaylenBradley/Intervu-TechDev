# backend/app/api/jobs.py
from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import RedirectResponse, JSONResponse
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
from app.models.user import User
import os
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from google.oauth2.credentials import Credentials
import pathlib
import json
from app.models.job import JobApplication

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/jobs", response_model=JobApplicationResponse)
def create_application(job_data: JobApplicationCreate, db: Session = Depends(get_db)):
    # The frontend sends firebase_id as user_id in the job data
    firebase_id = job_data.user_id
    user = db.query(User).filter(User.firebase_id == firebase_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    job_data.user_id = str(user.id)  # Convert integer to string for varchar column
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

@router.get("/jobs/{firebase_id}", response_model=List[JobApplicationResponse])
def get_applications(firebase_id: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.firebase_id == firebase_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return get_user_applications(db, str(user.id))  # Convert to string for varchar column

SCOPES = ['https://www.googleapis.com/auth/spreadsheets', 'https://www.googleapis.com/auth/drive.file']
CLIENT_SECRET_FILE = str(pathlib.Path(__file__).parent.parent / 'core' / 'client_secret.json')
TOKEN_FILE = str(pathlib.Path(__file__).parent.parent / 'core' / 'token.json')

@router.get("/jobs/export-to-sheets/{firebase_id}")
async def export_to_sheets(firebase_id: str, request: Request, db: Session = Depends(get_db)):
    # Step 1: OAuth flow
    creds = None
    if os.path.exists(TOKEN_FILE):
        creds = Credentials.from_authorized_user_file(TOKEN_FILE, SCOPES)
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file(CLIENT_SECRET_FILE, SCOPES)
            creds = flow.run_local_server(port=0)
        with open(TOKEN_FILE, 'w') as token:
            token.write(creds.to_json())

    # Step 2: Get user and their job applications
    user = db.query(User).filter(User.firebase_id == firebase_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    jobs = db.query(JobApplication).filter(JobApplication.user_id == str(user.id)).all()
    data = [["Company Name", "Job Title", "Status", "Applied Date", "Notes"]]
    for job in jobs:
        data.append([
            job.company_name,
            job.job_title,
            job.status.value if hasattr(job.status, 'value') else str(job.status),
            job.applied_date.strftime('%Y-%m-%d') if job.applied_date else '',
            job.notes or ''
        ])

    # Step 3: Create sheet and write data
    service = build('sheets', 'v4', credentials=creds)
    sheet = service.spreadsheets().create(body={
        'properties': {'title': f'Job Applications Export - {user.username}'}
    }).execute()
    sheet_id = sheet['spreadsheetId']
    service.spreadsheets().values().update(
        spreadsheetId=sheet_id,
        range='A1',
        valueInputOption='RAW',
        body={'values': data}
    ).execute()
    sheet_url = f'https://docs.google.com/spreadsheets/d/{sheet_id}'
    return {"sheet_url": sheet_url}