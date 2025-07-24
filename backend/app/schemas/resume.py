from pydantic import BaseModel
from typing import Optional, Any
from datetime import datetime

class ResumeBase(BaseModel):
    file_name: str
    parsed_data: Any

class ResumeCreate(ResumeBase):
    file_data: bytes

class ResumeUpdate(BaseModel):
    file_name: Optional[str] = None
    file_data: Optional[bytes] = None
    parsed_data: Optional[Any] = None

class ResumeResponse(ResumeBase):
    id: str
    user_id: int
    uploaded_at: datetime

    class Config:
        orm_mode = True

class ResumeImproveResponse(BaseModel):
    improved_resume: str

class ResumeFeedbackResponse(BaseModel):
    feedback: str