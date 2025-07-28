from firebase_admin import auth
from sqlalchemy.orm import Session
from app.models.job_application import JobApplication
from app.models.job_description_roadmap import JobDescriptionRoadmap
from app.models.questionnaire import Questionnaire
from app.models.resume import Resume
from app.models.roadmap import Roadmap
from app.models.user import User
from app.schemas.user import UserCreate, UserResponse, UserUpdate

def create_user(db: Session, user: UserCreate):
    db_user = User(**user.dict())
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def set_questionnaire_completed(db: Session, id: int):
    user = db.query(User).filter(User.id == id).first()
    if user:
        user.questionnaire_completed = True
        db.commit()
        db.refresh(user)
    return user

def get_user(db: Session, id: int):
    return db.query(User).filter(User.id == id).first()

def get_user_by_firebase_id(db, firebase_id: str):
    return db.query(User).filter_by(firebase_id=firebase_id).first()

def get_questionnaire_status(db: Session, id: int) -> bool:
    user = db.query(User).filter(User.id == id).first()
    return user.questionnaire_completed if user else False

def update_user(db: Session, id: int, user_data: dict):
    db_user = db.query(User).filter(User.id == id).first()
    if not db_user:
        return None
    for field, value in user_data.items():
        if hasattr(db_user, field):
            setattr(db_user, field, value)
    db.commit()
    db.refresh(db_user)
    return db_user

def delete_user(db: Session, id: int, firebase_id: str):
    try:
        auth.delete_user(firebase_id)
    except Exception as e:
        pass

    db_user = db.query(User).filter(User.id == id).first()
    if not db_user:
        return False

    db.query(DailyStat).filter(DailyStat.user_id == id).delete()
    db.query(JobApplication).filter(JobApplication.user_id == id).delete()
    db.query(JobDescriptionRoadmap).filter(JobDescriptionRoadmap.user_id == id).delete()
    db.query(Questionnaire).filter(Questionnaire.user_id == id).delete()
    db.query(Resume).filter(Resume.user_id == id).delete()
    db.query(Roadmap).filter(Roadmap.user_id == id).delete()

    db.delete(db_user)
    db.commit()
    return True