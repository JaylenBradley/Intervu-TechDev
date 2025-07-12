from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from datetime import datetime
from app.core.database import SessionLocal
from app.schemas.videos import VideoResponse, RoadmapVideoResponse
from app.crud.videos import get_videos_by_query, get_roadmap_videos

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
    
    # Call CRUD function
    videos = get_videos_by_query(query, duration, language, num_videos)
    
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
    videos, search_terms, selected_term, error_message = get_roadmap_videos(db, user_id)
    
    if error_message:
        if error_message == "Questionnaire not found":
            raise HTTPException(status_code=404, detail="Questionnaire not found")
        return RoadmapVideoResponse(
            videos=[],
            search_terms=[],
            selected_term="",
            message=error_message
        )
    
    return RoadmapVideoResponse(
        videos=videos,
        search_terms=search_terms,
        selected_term=selected_term
    ) 