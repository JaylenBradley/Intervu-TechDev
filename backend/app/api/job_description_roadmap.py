from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.schemas.job_description_roadmap import JobDescriptionRoadmapCreate, JobDescriptionRoadmapOut
from app.crud import jobdesc_roadmap as crud
from app.core.database import SessionLocal

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/roadmap/jobdesc", response_model=JobDescriptionRoadmapOut)
def create_jobdesc_roadmap(data: JobDescriptionRoadmapCreate, db: Session = Depends(get_db)):
    roadmap = crud.create_jobdesc_roadmap(db, data)
    if not roadmap:
        raise HTTPException(status_code=400, detail="Failed to create roadmap")
    return roadmap

@router.get("/roadmap/jobdesc", response_model=List[JobDescriptionRoadmapOut])
def list_jobdesc_roadmaps(user_id: int = Query(...), db: Session = Depends(get_db)):
    roadmaps = crud.get_jobdesc_roadmaps_by_user(db, user_id)
    return roadmaps

@router.get("/roadmap/jobdesc/{roadmap_id}", response_model=JobDescriptionRoadmapOut)
def get_jobdesc_roadmap(roadmap_id: str, db: Session = Depends(get_db)):
    roadmap = crud.get_jobdesc_roadmap(db, roadmap_id)
    if not roadmap:
        raise HTTPException(status_code=404, detail="Roadmap not found")
    return roadmap

@router.delete("/roadmap/jobdesc/{roadmap_id}")
def delete_jobdesc_roadmap(roadmap_id: str, db: Session = Depends(get_db)):
    success = crud.delete_jobdesc_roadmap(db, roadmap_id)
    if not success:
        raise HTTPException(status_code=404, detail="Roadmap not found")
    return {"message": "Roadmap deleted successfully"}