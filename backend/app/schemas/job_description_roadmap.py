from pydantic import BaseModel
from typing import Any, Optional
from datetime import datetime

class JobDescriptionRoadmapCreate(BaseModel):
    user_id: int
    job_description: str
    title: str = "Untitled Roadmap"

class JobDescriptionRoadmapOut(JobDescriptionRoadmapCreate):
    id: str
    roadmap_json: Any
    created_at: Optional[datetime]
    updated_at: Optional[datetime]

    class Config:
        orm_mode = True

class JobDescriptionRoadmapUpdateTitle(BaseModel):
    title: str = "Untitled Roadmap"