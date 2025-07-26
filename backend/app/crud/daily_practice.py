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
        daily_stat_data = DailyStatCreate(
            user_id=user_id,
            date=stat_date,
            answered=0,
            score=0
        )
        db_stat = create_daily_stat(db, daily_stat_data)
    return db_stat
