from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
from app.core.database import SessionLocal
from app.schemas.roadmap import RoadmapResponse
from app.crud.roadmap import generate_roadmap

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
    
    roadmap_text = generate_roadmap(db, user_id)
    
    if not roadmap_text:
        raise HTTPException(status_code=404, detail="Questionnaire not found")
    
    return RoadmapResponse(roadmap=roadmap_text) 