from sqlalchemy import Column, String, Integer, ForeignKey
import uuid
from app.core.database import Base

class Questionnaire(Base):
    __tablename__ = "questionnaire"

    id = Column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(Integer, ForeignKey("user.id"), unique=True, nullable=False)
    career_goal = Column(String, nullable=False)
    major = Column(String, nullable=False)
    minor = Column(String, nullable=True)
    education_level = Column(String, nullable=False)
    interests = Column(String, nullable=False)
    institution = Column(String, nullable=False)
    target_companies = Column(String, nullable=False)
    skills = Column(String, nullable=True)
    certifications = Column(String, nullable=True)
    projects = Column(String, nullable=True)
    experience = Column(String, nullable=True)
    timeline = Column(String, nullable=False)
    learning_preference = Column(String, nullable=False)
    available_hours_per_week = Column(String, nullable=False)