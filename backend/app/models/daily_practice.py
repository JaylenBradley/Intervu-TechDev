from sqlalchemy import Column, Integer, Date, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from app.core.database import Base

class DailyStat(Base):
    __tablename__ = "daily_stats"

    id        = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id   = Column(Integer, ForeignKey("user.id"), nullable=False)
    date      = Column(Date, nullable=False)         
    goal      = Column(Integer, default=0, nullable=False)
    answered  = Column(Integer, default=0, nullable=False)
    score     = Column(Integer, default=0, nullable=False)
    streak    = Column(Integer, default=0, nullable=False) 
    
    user = relationship("User", backref="daily_stats")
    __table_args__ = (UniqueConstraint('user_id', 'date', name='_user_date_uc'),)


