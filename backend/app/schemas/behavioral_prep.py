from pydantic import BaseModel
from typing import List, Any, Optional, Dict

class BehavioralQuestionsRequest(BaseModel):
    target_role: str
    seniority: str
    company: str
    num_questions: int
    difficulty: str

class BehavioralQuestionsResponse(BaseModel):
    questions: List[str]

class BehavioralFeedbackRequest(BaseModel):
    target_role: str
    seniority: str
    company: str
    question: str
    answer: str
    difficulty: str
    pause_analysis: Optional[Dict] = None

class BehavioralFeedbackResponse(BaseModel):
    feedback: Any