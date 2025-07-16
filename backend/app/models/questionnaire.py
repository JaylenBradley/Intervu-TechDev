<<<<<<< HEAD
import uuid
from sqlalchemy import Column, String, Integer, ForeignKey
=======
from sqlalchemy import Column, String, Integer, ForeignKey
import uuid
>>>>>>> justin/dev
from app.core.database import Base

class Questionnaire(Base):
    __tablename__ = "questionnaire"

    id = Column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(Integer, ForeignKey("user.id"), unique=True, nullable=False)
    career_goal = Column(String)
    major = Column(String, nullable=False)
    education_level = Column(String)
    interests = Column(String)
    institution = Column(String)
    target_companies = Column(String)
    skills = Column(String)
    certifications = Column(String, nullable=True)
    projects = Column(String, nullable=True)
    experience = Column(String, nullable=True)
    timeline = Column(String)
    learning_preference = Column(String)
    available_hours_per_week = Column(String)