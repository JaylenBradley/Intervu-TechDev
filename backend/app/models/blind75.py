from sqlalchemy import Column, Integer, String, ForeignKey
from app.core.database import Base
import uuid

class Blind75(Base):
    __tablename__ = "blind75"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(Integer, ForeignKey("user.id"), nullable=False)
    title = Column(String, nullable=False)
    problem_type = Column(String, nullable=False) 
    difficulty = Column(String)
    status = Column(String, default="wrong") 

