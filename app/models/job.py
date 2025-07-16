from sqlalchemy import Column, String, DateTime, Text, Enum, Integer, ForeignKey
import uuid
from app.database import Base

class JobApplication(Base):
    __tablename__ = "job_applications"

    id = Column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(Integer, ForeignKey('user.id'), index=True)
    company_name = Column(String, nullable=False) 