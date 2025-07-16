<<<<<<< HEAD
import uuid
from sqlalchemy import Column, String, Integer, ForeignKey, JSON, DateTime, func
=======
from sqlalchemy import Column, String, Integer, ForeignKey, JSON, DateTime, func
import uuid
>>>>>>> justin/dev
from app.core.database import Base

class Roadmap(Base):
    __tablename__ = "roadmap"

<<<<<<< HEAD
    id = Column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
=======
    id = Column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4())) 
>>>>>>> justin/dev
    user_id = Column(Integer, ForeignKey("user.id"), unique=True, nullable=False)
    roadmap_json = Column(JSON, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())