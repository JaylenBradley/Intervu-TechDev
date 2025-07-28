from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import RedirectResponse, JSONResponse
from sqlalchemy.orm import Session
from typing import List
from app.core.database import SessionLocal
from app.schemas.job_application import JobApplicationCreate, JobApplicationUpdate, JobApplicationResponse
from app.crud.job_application import (
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
from app.models.job_application import JobApplication
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

    # Formatting improvements
    num_rows = len(data)
    num_cols = len(data[0])
    requests = [
        # Bold and color header row (deeper blue, white text)
        {
            "repeatCell": {
                "range": {
                    "sheetId": 0,
                    "startRowIndex": 0,
                    "endRowIndex": 1,
                    "startColumnIndex": 0,
                    "endColumnIndex": num_cols
                },
                "cell": {
                    "userEnteredFormat": {
                        "backgroundColor": {"red": 0.22, "green": 0.45, "blue": 0.75},
                        "textFormat": {"bold": True, "foregroundColor": {"red": 1, "green": 1, "blue": 1}}
                    }
                },
                "fields": "userEnteredFormat(backgroundColor,textFormat)"
            }
        },
        # Freeze header row
        {
            "updateSheetProperties": {
                "properties": {"sheetId": 0, "gridProperties": {"frozenRowCount": 1}},
                "fields": "gridProperties.frozenRowCount"
            }
        },
        # Auto-resize columns
        {
            "autoResizeDimensions": {
                "dimensions": {
                    "sheetId": 0,
                    "dimension": "COLUMNS",
                    "startIndex": 0,
                    "endIndex": num_cols
                }
            }
        },
        # Set manual minimum widths for all columns
        {
            "updateDimensionProperties": {
                "range": {"sheetId": 0, "dimension": "COLUMNS", "startIndex": 0, "endIndex": 1},
                "properties": {"pixelSize": 140},
                "fields": "pixelSize"
            }
        },
        {
            "updateDimensionProperties": {
                "range": {"sheetId": 0, "dimension": "COLUMNS", "startIndex": 1, "endIndex": 2},
                "properties": {"pixelSize": 140},
                "fields": "pixelSize"
            }
        },
        {
            "updateDimensionProperties": {
                "range": {"sheetId": 0, "dimension": "COLUMNS", "startIndex": 2, "endIndex": 3},
                "properties": {"pixelSize": 110},
                "fields": "pixelSize"
            }
        },
        {
            "updateDimensionProperties": {
                "range": {"sheetId": 0, "dimension": "COLUMNS", "startIndex": 3, "endIndex": 4},
                "properties": {"pixelSize": 120},
                "fields": "pixelSize"
            }
        },
        {
            "updateDimensionProperties": {
                "range": {"sheetId": 0, "dimension": "COLUMNS", "startIndex": 4, "endIndex": 5},
                "properties": {"pixelSize": 200},
                "fields": "pixelSize"
            }
        },
        # Add filter to header row
        {
            "setBasicFilter": {
                "filter": {
                    "range": {
                        "sheetId": 0,
                        "startRowIndex": 0,
                        "endRowIndex": num_rows,
                        "startColumnIndex": 0,
                        "endColumnIndex": num_cols
                    }
                }
            }
        },
        # Format Applied Date column (index 3) as YYYY-MM-DD
        {
            "repeatCell": {
                "range": {
                    "sheetId": 0,
                    "startRowIndex": 1,
                    "endRowIndex": num_rows,
                    "startColumnIndex": 3,
                    "endColumnIndex": 4
                },
                "cell": {
                    "userEnteredFormat": {
                        "numberFormat": {"type": "DATE", "pattern": "yyyy-mm-dd"}
                    }
                },
                "fields": "userEnteredFormat.numberFormat"
            }
        },
        # Add borders to the table
        {
            "updateBorders": {
                "range": {
                    "sheetId": 0,
                    "startRowIndex": 0,
                    "endRowIndex": num_rows,
                    "startColumnIndex": 0,
                    "endColumnIndex": num_cols
                },
                "top":    {"style": "SOLID", "width": 1, "color": {"red": 0.6, "green": 0.6, "blue": 0.6}},
                "bottom": {"style": "SOLID", "width": 1, "color": {"red": 0.6, "green": 0.6, "blue": 0.6}},
                "left":   {"style": "SOLID", "width": 1, "color": {"red": 0.6, "green": 0.6, "blue": 0.6}},
                "right":  {"style": "SOLID", "width": 1, "color": {"red": 0.6, "green": 0.6, "blue": 0.6}},
                "innerHorizontal": {"style": "SOLID", "width": 1, "color": {"red": 0.85, "green": 0.85, "blue": 0.85}},
                "innerVertical":   {"style": "SOLID", "width": 1, "color": {"red": 0.85, "green": 0.85, "blue": 0.85}}
            }
        },
        # Add alternating row color (zebra striping) for even rows (soft blue)
        {
            "addConditionalFormatRule": {
                "rule": {
                    "ranges": [{
                        "sheetId": 0,
                        "startRowIndex": 1,
                        "endRowIndex": num_rows,
                        "startColumnIndex": 0,
                        "endColumnIndex": num_cols
                    }],
                    "booleanRule": {
                        "condition": {
                            "type": "CUSTOM_FORMULA",
                            "values": [{"userEnteredValue": "=ISEVEN(ROW(A2))"}]
                        },
                        "format": {
                            "backgroundColor": {"red": 0.89, "green": 0.94, "blue": 0.99}
                        }
                    }
                },
                "index": 0
            }
        },
        # Add alternating row color for odd rows (very light gray)
        {
            "addConditionalFormatRule": {
                "rule": {
                    "ranges": [{
                        "sheetId": 0,
                        "startRowIndex": 1,
                        "endRowIndex": num_rows,
                        "startColumnIndex": 0,
                        "endColumnIndex": num_cols
                    }],
                    "booleanRule": {
                        "condition": {
                            "type": "CUSTOM_FORMULA",
                            "values": [{"userEnteredValue": "=ISODD(ROW(A2))"}]
                        },
                        "format": {
                            "backgroundColor": {"red": 0.98, "green": 0.98, "blue": 0.98}
                        }
                    }
                },
                "index": 1
            }
        }
    ]
    service.spreadsheets().batchUpdate(
        spreadsheetId=sheet_id,
        body={"requests": requests}
    ).execute()
    sheet_url = f'https://docs.google.com/spreadsheets/d/{sheet_id}'
    return RedirectResponse(sheet_url)