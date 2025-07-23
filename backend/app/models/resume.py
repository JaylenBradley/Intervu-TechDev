from sqlalchemy import Column, Integer, ForeignKey, String, LargeBinary, JSON, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base
import uuid

class Resume(Base):
    __tablename__ = "resume"

    id = Column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(Integer, ForeignKey("user.id"), nullable=False, unique=True)
    file_name = Column(String, nullable=False)
    file_data = Column(LargeBinary, nullable=False)  # Store PDF as binary
    parsed_data = Column(JSON, nullable=False)       # Store parsed fields as JSON
    uploaded_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", backref="resume", uselist=False) 