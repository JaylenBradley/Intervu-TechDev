from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List
from app.schemas.job_description_roadmap import (
    JobDescriptionRoadmapCreate,
    JobDescriptionRoadmapOut,
    JobDescriptionRoadmapUpdateTitle
)
from app.crud.job_description_roadmap import (
    create_job_description_roadmap,
    get_job_description_roadmaps_by_user,
    get_job_description_roadmap,
    update_job_description_roadmap_title,
    delete_job_description_roadmap
)
from app.core.database import SessionLocal

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/roadmap/jobdesc/generate", response_model=JobDescriptionRoadmapOut)
def create_job_description_roadmap_endpoint(data: JobDescriptionRoadmapCreate, db: Session = Depends(get_db)):
    return create_job_description_roadmap(db, data)

@router.get("/roadmap/jobdesc/{user_id}", response_model=List[JobDescriptionRoadmapOut])
def list_job_description_roadmaps_endpoint(user_id: int, db: Session = Depends(get_db)):
    return get_job_description_roadmaps_by_user(db, user_id)

@router.get("/roadmap/jobdesc/{user_id}/{roadmap_id}", response_model=JobDescriptionRoadmapOut)
def get_job_description_roadmap_endpoint(user_id: int, roadmap_id: str, db: Session = Depends(get_db)):
    roadmap = get_job_description_roadmap(db, roadmap_id)
    if not roadmap:
        raise HTTPException(status_code=404, detail="Roadmap not found")
    return roadmap

@router.patch("/roadmap/jobdesc/{roadmap_id}/title", response_model=JobDescriptionRoadmapOut)
def update_job_description_roadmap_title_endpoint(
    roadmap_id: str,
    data: JobDescriptionRoadmapUpdateTitle,
    db: Session = Depends(get_db)
):
    roadmap = update_job_description_roadmap_title(db, roadmap_id, data.title)
    if not roadmap:
        raise HTTPException(status_code=404, detail="Roadmap not found")
    return roadmap

@router.delete("/roadmap/jobdesc/{roadmap_id}")
def delete_job_description_roadmap_endpoint(roadmap_id: str, db: Session = Depends(get_db)):
    success = delete_job_description_roadmap(db, roadmap_id)
    if not success:
        raise HTTPException(status_code=404, detail="Roadmap not found")
    return {"message": "Roadmap deleted successfully"}