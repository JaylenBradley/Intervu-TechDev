from pydantic import BaseModel
from typing import Optional, List, Dict, Any

class VideoResponse(BaseModel):
    videos: List[Dict[str, Any]]
    
    class Config:
        from_attributes = True

class RoadmapVideoResponse(BaseModel):
    videos: List[Dict[str, Any]]
    search_terms: List[str]
    selected_term: str
    message: Optional[str] = None
    
    class Config:
        from_attributes = True

class VideoError(BaseModel):
    detail: str 