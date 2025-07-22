from sqlalchemy.orm import Session
from app.models.resume import Resume
from app.schemas.resume import ResumeCreate, ResumeUpdate
import json

def upsert_resume(db: Session, user_id: int, file_name: str, file_data: bytes, parsed_data: dict):
    db_obj = db.query(Resume).filter(Resume.user_id == user_id).first()
    if db_obj:
        db_obj.file_name = file_name
        db_obj.file_data = file_data
        db_obj.parsed_data = parsed_data
    else:
        db_obj = Resume(
            user_id=user_id,
            file_name=file_name,
            file_data=file_data,
            parsed_data=parsed_data
        )
        db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

def get_resume(db: Session, user_id: int):
    return db.query(Resume).filter(Resume.user_id == user_id).first()

def update_resume(db: Session, user_id: int, data: ResumeUpdate):
    db_obj = db.query(Resume).filter(Resume.user_id == user_id).first()
    if not db_obj:
        return None
    for field, value in data.dict(exclude_unset=True).items():
        setattr(db_obj, field, value)
    db.commit()
    db.refresh(db_obj)
    return db_obj

def delete_resume(db: Session, user_id: int):
    db_obj = db.query(Resume).filter(Resume.user_id == user_id).first()
    if not db_obj:
        return False
    db.delete(db_obj)
    db.commit()
    return True 