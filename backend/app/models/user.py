from sqlalchemy import Column, String, Integer, Boolean, DateTime
from sqlalchemy.sql import func
from app.core.database import Base

class User(Base):
    __tablename__ = "user"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    firebase_id = Column(String, unique=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    login_method = Column(String, nullable=False)
    questionnaire_completed = Column(Boolean, default=False)
    avatar = Column(String, nullable=True)
    name = Column(String, nullable=True)
    bio = Column(String, nullable=True)
    education = Column(String, nullable=True)
    career_goal = Column(String, nullable=True)
    github = Column(String, nullable=True)
    linkedin = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())