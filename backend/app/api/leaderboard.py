from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.crud.daily_stats import calculate_current_streak
from app.crud.user import get_user
from app.models.user import User
from app.models.daily_stats import DailyStat
from typing import List
from sqlalchemy import func, desc

# Leaderboard API router for streaks and points
router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/leaderboards/streaks", response_model=List[dict])
def get_leaderboard_by_streaks(limit: int = 10, db: Session = Depends(get_db)):
    """Get top users by current streaks"""
    # Get all users with their current streaks
    users_with_streaks = []
    
    users = db.query(User).all()
    for user in users:
        current_streak = calculate_current_streak(db, user.id)
        if current_streak > 0:  # Only include users with active streaks
            users_with_streaks.append({
                "user_id": user.id,
                "username": user.username,
                "avatar": user.avatar,
                "career_goal": user.career_goal,
                "streak": current_streak
            })
    
    # Sort by streak (descending) and limit results
    users_with_streaks.sort(key=lambda x: x["streak"], reverse=True)
    return users_with_streaks[:limit]

@router.get("/leaderboards/points", response_model=List[dict])
def get_leaderboard_by_points(limit: int = 10, db: Session = Depends(get_db)):
    """Get top users by total accumulated points from entire history"""
    # Get total accumulated points for each user from their entire history
    user_points = db.query(
        User.id,
        User.username,
        User.avatar,
        User.career_goal,
        func.sum(DailyStat.score).label('total_points')
    ).join(DailyStat, User.id == DailyStat.user_id)\
     .group_by(User.id, User.username, User.avatar, User.career_goal)\
     .having(func.sum(DailyStat.score) > 0)\
     .order_by(desc(func.sum(DailyStat.score)))\
     .limit(limit)\
     .all()
    
    return [
        {
            "user_id": user.id,
            "username": user.username,
            "avatar": user.avatar,
            "career_goal": user.career_goal,
            "total_points": int(user.total_points)
        }
        for user in user_points
    ] 