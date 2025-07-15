# backend/app/schemas/questionnaire.py
from pydantic import BaseModel
from typing import List, Optional

class QuestionnaireBase(BaseModel):
    career_goal: str
    major: str
    education_level: str
    passions: List[str]
    institution: str
    target_companies: List[str]
    skills: List[str]
    certifications: Option[List[str]] = None
    projects: Optional[str] = None
    experience: Optional[str] = None
    timeline: str
    learning_preference: str
    available_hours_per_week: str

class QuestionnaireCreate(QuestionnaireBase):
    user_id: str

class QuestionnaireResponse(QuestionnaireBase):
    user_id: str

    class Config:
        orm_mode = True