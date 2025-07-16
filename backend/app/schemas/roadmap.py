from pydantic import BaseModel
from typing import Any

class RoadmapResponse(BaseModel):
    roadmap_json: Any

    class Config:
        from_attributes = True

class RoadmapError(BaseModel):
    detail: str