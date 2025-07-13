from pydantic import BaseModel
from typing import Optional, List

class RoadmapResponse(BaseModel):
    roadmap: str
    
    class Config:
        from_attributes = True

class RoadmapError(BaseModel):
    detail: str 