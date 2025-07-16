from sqlalchemy.orm import Session
from app.models.roadmap import Roadmap
import json

def upsert_roadmap(db: Session, user_id: int, roadmap_json: dict):
    db_obj = db.query(Roadmap).filter(Roadmap.user_id == user_id).first()
    if db_obj:
        db_obj.roadmap_json = roadmap_json
    else:
        db_obj = Roadmap(user_id=user_id, roadmap_json=roadmap_json)
        db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

def get_roadmap(db: Session, user_id: int):
    return db.query(Roadmap).filter(Roadmap.user_id == user_id).first()