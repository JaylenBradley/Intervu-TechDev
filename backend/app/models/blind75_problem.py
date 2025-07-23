import uuid
from sqlalchemy import Column, String, JSON               
from app.core.database import Base

class Blind75Problem(Base):
    __tablename__ = "blind75_problem"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    title = Column(String, unique=True, nullable=False)
    problem_type = Column(String, nullable=False)
    difficulty = Column(String, nullable=False)
    time_complexity = Column(String, nullable=False)
    space_complexity = Column(String, nullable=False)
    prompt = Column(String, nullable=False)
    solution = Column(JSON, nullable=False)
