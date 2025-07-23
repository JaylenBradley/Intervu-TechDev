from pydantic import BaseModel
from typing import Any, Optional
from datetime import datetime

class JobDescriptionRoadmapCreate(BaseModel):
    user_id: int
    job_description: str

class JobDescriptionRoadmapOut(BaseModel):
    id: int
    user_id: int
    job_description: str
    roadmap_json: Any
    created_at: Optional[datetime]
    updated_at: Optional[datetime]

    class Config:
        orm_mode = True