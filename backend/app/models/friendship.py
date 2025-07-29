from sqlalchemy import Column, Integer, ForeignKey, DateTime, func, UniqueConstraint
from app.core.database import Base

class Friendship(Base):
    __tablename__ = "friendship"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    follower_id = Column(Integer, ForeignKey("user.id"), nullable=False)
    following_id = Column(Integer, ForeignKey("user.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Ensure a user can't follow themselves and prevent duplicate friendships
    __table_args__ = (
        UniqueConstraint('follower_id', 'following_id', name='unique_friendship'),
    ) 