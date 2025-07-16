from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.schemas.roadmap import RoadmapResponse, RoadmapError
from app.crud.roadmap import upsert_roadmap, get_roadmap
from app.crud.questionnaire import get_questionnaire
from app.utils.get_roadmap import get_roadmap as genai_get_roadmap
import json

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/roadmap/{user_id}", response_model=RoadmapResponse, responses={404: {"model": RoadmapError}})
def generate_and_store_roadmap(user_id: int, db: Session = Depends(get_db)):
    questionnaire = get_questionnaire(db, user_id)
    if not questionnaire:
        raise HTTPException(status_code=404, detail="Questionnaire not found")
    # Convert questionnaire ORM to dict
    questionnaire_dict = {c.name: getattr(questionnaire, c.name) for c in questionnaire.__table__.columns}
    # Generate roadmap text from GenAI
    roadmap_json = genai_get_roadmap(questionnaire_dict)
    db_obj = upsert_roadmap(db, user_id, roadmap_json)
    return RoadmapResponse(roadmap_json=db_obj.roadmap_json)

@router.get("/roadmap/{user_id}", response_model=RoadmapResponse, responses={404: {"model": RoadmapError}})
def get_roadmap_endpoint(user_id: int, db: Session = Depends(get_db)):
    db_obj = get_roadmap(db, user_id)
    if not db_obj:
        raise HTTPException(status_code=404, detail="Roadmap not found")
    return RoadmapResponse(roadmap_json=db_obj.roadmap_json)