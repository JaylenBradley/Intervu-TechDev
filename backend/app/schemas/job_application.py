# backend/app/schemas/job_application.py
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from enum import Enum

class ApplicationStatus(str, Enum):
    APPLIED = "applied"
    INTERVIEWING = "interviewing"
    OFFER = "offer"
    REJECTED = "rejected"
    WITHDRAWN = "withdrawn"

class JobApplicationBase(BaseModel):
    company_name: str
    job_title: str
    job_description: Optional[str] = None
    application_url: Optional[str] = None
    status: ApplicationStatus = ApplicationStatus.APPLIED
    notes: Optional[str] = None
    salary_range: Optional[str] = None
    location: Optional[str] = None

class JobApplicationCreate(JobApplicationBase):
    user_id: int

class JobApplicationUpdate(BaseModel):
    company_name: Optional[str] = None
    job_title: Optional[str] = None
    job_description: Optional[str] = None
    application_url: Optional[str] = None
    status: Optional[ApplicationStatus] = None
    notes: Optional[str] = None
    salary_range: Optional[str] = None
    location: Optional[str] = None

class JobApplicationResponse(JobApplicationBase):
    id: str
    user_id: int
    applied_date: datetime
    updated_date: datetime

    class Config:
        from_attributes = True 