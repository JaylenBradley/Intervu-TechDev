from sqlalchemy import Column, Integer, String, Date, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
import uuid
from app.core.database import Base

class DailyStat(Base):
    __tablename__ = "daily_stats"

    id        = Column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    user_id   = Column(Integer, ForeignKey("user.id"), nullable=False)
    date      = Column(Date, nullable=False)         
    goal      = Column(Integer, default=0, nullable=False)
    answered  = Column(Integer, default=0, nullable=False)
    score     = Column(Integer, default=0, nullable=False)
    streak    = Column(Integer, default=0, nullable=False) 
    
    user = relationship("User", backref="daily_stats")
    __table_args__ = (UniqueConstraint('user_id', 'date', name='_user_date_uc'),)


