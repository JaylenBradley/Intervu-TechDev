from pydantic import BaseModel
from typing import List, Optional

class QuestionnaireBase(BaseModel):
    career_goal: str
    major: List[str]
    minor: Optional[List[str]] = None
    education_level: str
    interests: List[str]
    institution: str
    target_companies: List[str]
    skills: List[str]
    certifications: Optional[List[str]] = None
    projects: Optional[List[str]] = None
    experience: Optional[List[str]] = None
    timeline: str
    learning_preference: str
    available_hours_per_week: str

class QuestionnaireCreate(QuestionnaireBase):
    user_id: int

class QuestionnaireResponse(QuestionnaireBase):
    user_id: int

    class Config:
        orm_mode = True