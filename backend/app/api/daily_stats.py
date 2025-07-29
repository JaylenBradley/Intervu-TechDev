from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.schemas.daily_stats import DailyStatCreate, DailyStatUpdate, DailyStatResponse, GoalUpdateRequest
from app.crud.daily_stats import (
    get_daily_stat, 
    get_daily_stats_by_user,
    update_daily_stat,
    get_or_create_daily_stat,
    calculate_current_streak,
    _refresh_streak
)
from app.crud.user import get_user
from datetime import date
from typing import List

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/daily-practice/{user_id}/goal", response_model=DailyStatResponse)
def update_goal(user_id: int, request: GoalUpdateRequest, stat_date: date = None, db: Session = Depends(get_db)):
    """Update the goal for a specific day (defaults to today)"""
    # Check if user exists
    user = get_user(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if stat_date is None:
        stat_date = date.today()
    
    db_stat = get_or_create_daily_stat(db, user_id, stat_date)
    updates = DailyStatUpdate(goal=request.goal)
    updated_stat = update_daily_stat(db, user_id, stat_date, updates)
    
    if not updated_stat:
        raise HTTPException(status_code=404, detail="Could not update daily stat")
    
    return _refresh_streak(db, user_id, stat_date)

@router.post("/daily-practice/{user_id}/answers", response_model=DailyStatResponse)
def update_answers(user_id: int, increment: int = 1, stat_date: date = None, db: Session = Depends(get_db)):
    """Increment the number of answers for today"""
    # Check if user exists
    user = get_user(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if stat_date is None:
        stat_date = date.today()
    
    db_stat = get_or_create_daily_stat(db, user_id, stat_date)
    new_answered = db_stat.answered + increment
    updates = DailyStatUpdate(answered=new_answered)
    updated_stat = update_daily_stat(db, user_id, stat_date, updates)
    
    if not updated_stat:
        raise HTTPException(status_code=404, detail="Could not update daily stat")
    
    return _refresh_streak(db, user_id, stat_date)

@router.post("/daily-practice/{user_id}/score", response_model=DailyStatResponse)
def update_score(user_id: int, score_increment: int, stat_date: date = None, db: Session = Depends(get_db)):
    """Add to the daily score for a user"""
    user = get_user(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if stat_date is None:
        stat_date = date.today()
    
    db_stat = get_or_create_daily_stat(db, user_id, stat_date)
    new_score = db_stat.score + score_increment
    updates = DailyStatUpdate(score=new_score)
    updated_stat = update_daily_stat(db, user_id, stat_date, updates)
    
    if not updated_stat:
        raise HTTPException(status_code=404, detail="Could not update daily stat")
    
    return _refresh_streak(db, user_id, stat_date)

@router.get("/daily-practice/{user_id}/goal", response_model=DailyStatResponse)
def get_goal(user_id: int, stat_date: date = None, db: Session = Depends(get_db)):
    """Get the goal for a specific day (defaults to today)"""
    # Check if user exists
    user = get_user(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if stat_date is None:
        stat_date = date.today()
    
    db_stat = get_or_create_daily_stat(db, user_id, stat_date)
    return db_stat

@router.get("/daily-practice/{user_id}/today", response_model=DailyStatResponse)
def get_today_stats(user_id: int, db: Session = Depends(get_db)):
    """Get today's practice statistics for a user"""
    user = get_user(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    today = date.today()
    db_stat = get_or_create_daily_stat(db, user_id, today)
    return _refresh_streak(db, user_id, today)

@router.get("/daily-practice/{user_id}/streak")
def get_current_streak(user_id: int, db: Session = Depends(get_db)):
    """Get the current streak for a user"""
    user = get_user(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    current_streak = calculate_current_streak(db, user_id)
    return {"user_id": user_id, "current_streak": current_streak}

@router.get("/daily-practice/{user_id}/history", response_model=List[DailyStatResponse])
def get_practice_history(user_id: int, limit: int = 30, db: Session = Depends(get_db)):
    """Get practice history for a user (last 30 days by default)"""
    stats = get_daily_stats_by_user(db, user_id, limit)
    
    updated_stats = []
    for stat in stats:
        current_streak = calculate_current_streak(db, user_id, stat.date)
        if stat.streak != current_streak:
            stat.streak = current_streak
            db.commit()
            db.refresh(stat)
        updated_stats.append(stat)
    
    return updated_stats

@router.get("/daily-practice/{user_id}/{stat_date}", response_model=DailyStatResponse)
def get_stats_by_date(user_id: int, stat_date: date, db: Session = Depends(get_db)):
    """Get practice statistics for a specific date"""
    db_stat = get_daily_stat(db, user_id, stat_date)
    if not db_stat:
        raise HTTPException(status_code=404, detail="No statistics found for this date")
    return db_stat

