from sqlalchemy import Column, String, Integer, Boolean
from app.core.database import Base

class User(Base):
    __tablename__ = "user"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    firebase_id = Column(String, unique=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    login_method = Column(String, nullable=False)
    career_goal = Column(String, nullable=True)
    questionnaire_completed = Column(Boolean, default=False)