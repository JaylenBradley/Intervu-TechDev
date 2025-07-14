from pydantic import BaseModel

class ResumeImproveResponse(BaseModel):
    improved_resume: str

class ResumeFeedbackResponse(BaseModel):
    feedback: str