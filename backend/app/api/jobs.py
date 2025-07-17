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
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from google.oauth2.credentials import Credentials
import pathlib
from app.models.job import JobApplication
from google.auth.transport.requests import Request as GoogleRequest
from app.core.config import GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_PROJECT_ID
import os

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/jobs", response_model=JobApplicationResponse)
def create_application(job_data: JobApplicationCreate, db: Session = Depends(get_db)):
    user_id = job_data.user_id
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
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
def get_applications(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return get_user_applications(db, user_id)

SCOPES = ['https://www.googleapis.com/auth/spreadsheets', 'https://www.googleapis.com/auth/drive.file']
TOKEN_FILE = str(pathlib.Path(__file__).parent.parent / 'core' / 'token.json')

@router.get("/jobs/export-to-sheets/{user_id}")
async def export_to_sheets(user_id: int, request: Request, db: Session = Depends(get_db)):
    creds = None
    if os.path.exists(TOKEN_FILE):
        creds = Credentials.from_authorized_user_file(TOKEN_FILE, SCOPES)
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(GoogleRequest())
        else:
            client_config = {
                "installed": {
                    "client_id": GOOGLE_CLIENT_ID,
                    "project_id": GOOGLE_PROJECT_ID,
                    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                    "token_uri": "https://oauth2.googleapis.com/token",
                    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
                    "client_secret": GOOGLE_CLIENT_SECRET,
                    "redirect_uris": ["http://localhost"]
                }
            }
            flow = InstalledAppFlow.from_client_config(client_config, SCOPES)
            creds = flow.run_local_server(port=0)
        with open(TOKEN_FILE, 'w') as token:
            token.write(creds.to_json())

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    jobs = db.query(JobApplication).filter(JobApplication.user_id == user_id).all()
    data = [["Company Name", "Job Title", "Status", "Applied Date", "Notes"]]
    for job in jobs:
        data.append([
            job.company_name,
            job.job_title,
            job.status.value if hasattr(job.status, 'value') else str(job.status),
            job.applied_date.strftime('%Y-%m-%d') if job.applied_date else '',
            job.notes or ''
        ])

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
    return RedirectResponse(sheet_url)