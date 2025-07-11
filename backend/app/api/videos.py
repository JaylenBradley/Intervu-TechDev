from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from datetime import datetime
from app.core.database import SessionLocal
from app.models.questionnaire import Questionnaire
from app.schemas.videos import VideoResponse, RoadmapVideoResponse
from app.utils.get_relevant_videos import get_videos, extract_youtube_search_terms
from app.utils.get_roadmap import get_roadmap

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/videos", response_model=VideoResponse)
def get_videos_endpoint(
    query: str = Query(..., description="Search query for videos"),
    duration: str = Query("any", description="Video duration filter"),
    language: str = Query("en", description="Video language"), 
    num_videos: int = Query(1, ge=1, le=10, description="Number of videos to return"),
    db: Session = Depends(get_db)
):
    """
    Get YouTube videos based on search parameters
    
    Returns a list of relevant YouTube videos based on the provided search criteria.
    """
    # Validate parameters
    valid_durations = ['any', 'short', 'medium', 'long']
    if duration not in valid_durations:
        raise HTTPException(status_code=400, detail=f"Duration must be one of: {valid_durations}")
    
    # Call original function
    videos = get_videos(query, duration, language, num_videos)
    
    return VideoResponse(videos=videos)

@router.get("/videos/roadmap/{user_id}", response_model=RoadmapVideoResponse)
def get_roadmap_videos_endpoint(
    user_id: str,
    db: Session = Depends(get_db)
):
    """
    Get videos based on user's roadmap
    
    Returns relevant videos based on the user's career roadmap and questionnaire responses.
    """
    # Get user's questionnaire
    questionnaire = db.query(Questionnaire).filter(Questionnaire.user_id == user_id).first()
    
    if not questionnaire:
        raise HTTPException(status_code=404, detail="Questionnaire not found")
    
    # Generate roadmap to get search terms with safe parsing
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
    
    roadmap_response = get_roadmap(questionnaire_data)
    
    # Handle different response types
    if hasattr(roadmap_response, 'text'):
        roadmap_text = roadmap_response.text
    elif isinstance(roadmap_response, str):
        roadmap_text = roadmap_response
    else:
        roadmap_text = str(roadmap_response)
    
    search_terms = extract_youtube_search_terms(roadmap_text)
    
    if not search_terms:
        return RoadmapVideoResponse(
            videos=[],
            search_terms=[],
            selected_term="",
            message="No video search terms found in roadmap"
        )
    
    # Get videos for first search term
    videos = get_videos(search_terms[0], "any", "en", 5)
    
    return RoadmapVideoResponse(
        videos=videos,
        search_terms=search_terms,
        selected_term=search_terms[0]
    ) 