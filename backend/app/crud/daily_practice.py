from sqlalchemy.orm import Session
from app.models.daily_practice import DailyStat
from app.schemas.daily_practice import DailyStatCreate, DailyStatUpdate
from datetime import date

def create_daily_stat(db: Session, daily_stat: DailyStatCreate):
    db_daily_stat = DailyStat(**daily_stat.dict())
    db.add(db_daily_stat)
    db.commit()
    db.refresh(db_daily_stat)
    return db_daily_stat

def get_daily_stat(db: Session, user_id: int, stat_date: date):
    return db.query(DailyStat).filter(
        DailyStat.user_id == user_id,
        DailyStat.date == stat_date
    ).first()

def get_daily_stats_by_user(db: Session, user_id: int, limit: int = 30):
    return db.query(DailyStat).filter(
        DailyStat.user_id == user_id
    ).order_by(DailyStat.date.desc()).limit(limit).all()

def update_daily_stat(db: Session, user_id: int, stat_date: date, updates: DailyStatUpdate):
    db_stat = get_daily_stat(db, user_id, stat_date)
    if db_stat:
        update_data = updates.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_stat, field, value)
        db.commit()
        db.refresh(db_stat)
    return db_stat

def get_or_create_daily_stat(db: Session, user_id: int, stat_date: date):
    db_stat = get_daily_stat(db, user_id, stat_date)
    if not db_stat:
        previous_goal = get_user_latest_goal(db, user_id)
        
        daily_stat_data = DailyStatCreate(
            user_id=user_id,
            date=stat_date,
            answered=0,
            score=0,
            goal=previous_goal if previous_goal > 0 else 0
        )
        db_stat = create_daily_stat(db, daily_stat_data)
    return db_stat

def get_user_latest_goal(db: Session, user_id: int):
    """Get the most recent goal set by the user"""
    latest_stat = db.query(DailyStat).filter(
        DailyStat.user_id == user_id,
        DailyStat.goal > 0
    ).order_by(DailyStat.date.desc()).first()
    
    return latest_stat.goal if latest_stat else 0

def calculate_current_streak(db: Session, user_id: int, target_date: date = None):
    if target_date is None:
        target_date = date.today()
    
    stats = db.query(DailyStat).filter(
        DailyStat.user_id == user_id,
        DailyStat.date <= target_date,
        DailyStat.goal > 0  
    ).order_by(DailyStat.date.desc()).all()
    
    if not stats:
        return 0
    
    stats_by_date = {}
    for stat in stats:
        if stat.date not in stats_by_date:
            stats_by_date[stat.date] = stat
    
    sorted_dates = sorted(stats_by_date.keys(), reverse=True)
    
    if not sorted_dates:
        return 0
    
    target_stat = stats_by_date.get(target_date)
    target_goal_completed = (target_stat and 
                           target_stat.answered >= target_stat.goal and 
                           target_stat.goal > 0)
    
    if not target_goal_completed:
        previous_dates = [d for d in sorted_dates if d < target_date]
        if not previous_dates:
            return 0
        
        most_recent_previous = max(previous_dates)
        return calculate_current_streak(db, user_id, most_recent_previous)
    
    streak = 0
    for stat_date in sorted_dates:
        stat = stats_by_date[stat_date]
        goal_met = stat.answered >= stat.goal and stat.goal > 0
        if goal_met:
            streak += 1
        else:
            break  
    
    return streak

def update_streak_for_user(db: Session, user_id: int, stat_date: date = None):
    """Update the streak field for a specific date"""
    if stat_date is None:
        stat_date = date.today()
    
    current_streak = calculate_current_streak(db, user_id, stat_date)
    db_stat = get_daily_stat(db, user_id, stat_date)
    if db_stat:
        db_stat.streak = current_streak
        db.commit()
        db.refresh(db_stat)
    
    return current_streak

def _refresh_streak(db: Session, user_id: int, stat_date: date):
    """Re‑calculate the current streak and persist it on the *same* DailyStat row."""
    streak = calculate_current_streak(db, user_id, stat_date)
    db_stat = get_daily_stat(db, user_id, stat_date)
    if db_stat and db_stat.streak != streak:
        db_stat.streak = streak
        db.commit()
        db.refresh(db_stat)
    return db_stat