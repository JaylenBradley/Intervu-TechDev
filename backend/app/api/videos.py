from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime

from app.core.database import get_db
from app.models.user import User
from app.models.questionnaire import Questionnaire
from app.utils.get_relevant_videos import get_videos, extract_youtube_search_terms
from app.utils.get_roadmap import get_roadmap

router = APIRouter()

@router.get("/videos")
async def get_videos_endpoint(
    query: str,
    duration: str = "any",
    language: str = "en", 
    num_videos: int = 1,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get YouTube videos based on search parameters"""
    
    # Validate parameters
    valid_durations = ['any', 'short', 'medium', 'long']
    if duration not in valid_durations:
        raise HTTPException(status_code=400, detail=f"Duration must be one of: {valid_durations}")
    
    if num_videos < 1 or num_videos > 10:
        raise HTTPException(status_code=400, detail="num_videos must be between 1 and 10")
    
    # Call original function
    videos = get_videos(query, duration, language, num_videos)
    
    # Return JSON instead of printing
    return {"videos": videos}

@router.get("/videos/roadmap")
async def get_roadmap_videos_endpoint(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get videos based on user's roadmap"""
    
    # Get user's questionnaire
    questionnaire = db.query(Questionnaire).filter(Questionnaire.user_id == current_user.id).first()
    
    if not questionnaire:
        raise HTTPException(status_code=404, detail="Questionnaire not found")
    
    # Generate roadmap to get search terms
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
    
    roadmap_response = get_roadmap(questionnaire_data)
    search_terms = extract_youtube_search_terms(roadmap_response.text)
    
    if not search_terms:
        return {"videos": [], "message": "No video search terms found in roadmap"}
    
    # Get videos for first search term
    videos = get_videos(search_terms[0], "any", "en", 5)
    
    return {
        "videos": videos,
        "search_terms": search_terms,
        "selected_term": search_terms[0]
    } 