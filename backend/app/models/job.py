from sqlalchemy import Column, String, DateTime, Text, Enum
from sqlalchemy.sql import func
from app.core.database import Base
import enum

class ApplicationStatus(enum.Enum):
    APPLIED = "applied"
    INTERVIEWING = "interviewing"
    OFFER = "offer"
    REJECTED = "rejected"
    WITHDRAWN = "withdrawn"

class JobApplication(Base):
    __tablename__ = "job_applications"

    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, index=True)
    company_name = Column(String, nullable=False)
    job_title = Column(String, nullable=False)
    job_description = Column(Text)
    application_url = Column(String)
    status = Column(Enum(ApplicationStatus), default=ApplicationStatus.APPLIED)
    applied_date = Column(DateTime, default=func.now())
    updated_date = Column(DateTime, default=func.now(), onupdate=func.now())
    notes = Column(Text)
    salary_range = Column(String)
    location = Column(String)
