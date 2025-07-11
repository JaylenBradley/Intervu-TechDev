from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
from app.core.database import SessionLocal
from app.models.questionnaire import Questionnaire
from app.schemas.roadmap import RoadmapResponse
from app.utils.get_roadmap import get_roadmap

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/roadmap/{user_id}", response_model=RoadmapResponse)
def get_roadmap_endpoint(user_id: str, db: Session = Depends(get_db)):
    """Get roadmap based on user's questionnaire"""
    
    # Get user's questionnaire
    questionnaire = db.query(Questionnaire).filter(Questionnaire.user_id == user_id).first()
    
    if not questionnaire:
        raise HTTPException(status_code=404, detail="Questionnaire not found")
    
    # Convert to dict format with safe parsing
    questionnaire_data = {
        "career_goal": questionnaire.career_goal or "",
        "major": questionnaire.major or "",
        "education_level": questionnaire.education_level or "",
        "passions": questionnaire.passions.split(",") if questionnaire.passions else [],
        "institution": questionnaire.institution or "",
        "target_companies": questionnaire.target_companies.split(",") if questionnaire.target_companies else [],
        "skills": questionnaire.skills.split(",") if questionnaire.skills else [],
        "certifications": questionnaire.certifications.split(",") if questionnaire.certifications else [],
        "projects": questionnaire.projects or "",
        "experience": questionnaire.experience or "",
        "timeline": questionnaire.timeline or "",
        "learning_preference": questionnaire.learning_preference or "",
        "available_hours_per_week": questionnaire.available_hours_per_week or "",
    }
    
    # Call original function
    roadmap_response = get_roadmap(questionnaire_data)
    
    # Handle different response types
    if hasattr(roadmap_response, 'text'):
        roadmap_text = roadmap_response.text
    elif isinstance(roadmap_response, str):
        roadmap_text = roadmap_response
    else:
        roadmap_text = str(roadmap_response)
    
    return RoadmapResponse(roadmap=roadmap_text) 