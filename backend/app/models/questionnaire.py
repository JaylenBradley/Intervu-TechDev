from sqlalchemy import Column, String, Integer
from app.core.database import Base

class Questionnaire(Base):
    __tablename__ = "questionnaire"

    user_id = Column(Integer, primary_key=True, index=True)
    career_goal = Column(String)
    major = Column(String)
    education_level = Column(String)
    passions = Column(String)
    institution = Column(String)
    target_companies = Column(String)
    skills = Column(String)
    certifications = Column(String, nullable=True)
    projects = Column(String, nullable=True)
    experience = Column(String, nullable=True)
    timeline = Column(String)
    learning_preference = Column(String)
    available_hours_per_week = Column(String)