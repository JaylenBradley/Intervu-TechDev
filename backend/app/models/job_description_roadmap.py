from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, JSON
from sqlalchemy.sql import func
import uuid
from app.core.database import Base

class JobDescriptionRoadmap(Base):
    __tablename__ = "job_description_roadmaps"
    id = Column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(Integer, ForeignKey("user.id"), nullable=False)
    job_description = Column(Text, nullable=False)
    roadmap_json = Column(JSON, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())