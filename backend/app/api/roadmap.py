from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime

from app.core.database import get_db
from app.models.user import User
from app.models.questionnaire import Questionnaire
from app.utils.get_roadmap import get_roadmap

router = APIRouter()

@router.get("/roadmap")
async def get_roadmap_endpoint(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get roadmap based on user's questionnaire"""
    
    # Get user's questionnaire
    questionnaire = db.query(Questionnaire).filter(Questionnaire.user_id == current_user.id).first()
    
    if not questionnaire:
        raise HTTPException(status_code=404, detail="Questionnaire not found")
    
    # Convert to dict format
    questionnaire_data = {
        "career_goal": questionnaire.career_goal,
        "major": questionnaire.major,
        "education_level": questionnaire.education_level,
        "passions": questionnaire.passions.split(",") if questionnaire.passions else [],
        "institution": questionnaire.institution,
        "target_companies": questionnaire.target_companies.split(",") if questionnaire.target_companies else [],
        "skills": questionnaire.skills.split(",") if questionnaire.skills else [],
        "certifications": questionnaire.certifications.split(",") if questionnaire.certifications else [],
        "projects": questionnaire.projects,
        "experience": questionnaire.experience,
        "timeline": questionnaire.timeline,
        "learning_preference": questionnaire.learning_preference,
        "available_hours_per_week": questionnaire.available_hours_per_week,
    }
    
    # Call original function
    roadmap_response = get_roadmap(questionnaire_data)
    
    return {"roadmap": roadmap_response.text} 