from sqlalchemy.orm import Session
from app.models.questionnaire import Questionnaire
from app.schemas.questionnaire import QuestionnaireCreate

def upsert_questionnaire(db: Session, data: QuestionnaireCreate):
    db_obj = db.query(Questionnaire).filter(Questionnaire.user_id == data.user_id).first()
    if db_obj:
        for field, value in data.dict().items():
            if isinstance(value, list):
                setattr(db_obj, field, ",".join(value))
            else:
                setattr(db_obj, field, value)
    else:
        db_obj = Questionnaire(
            **{
                **data.dict(),
                "passions": ",".join(data.passions),
                "target_companies": ",".join(data.target_companies),
                "skills": ",".join(data.skills),
                "certifications": ",".join(data.certifications),
            }
        )
        db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

def get_questionnaire(db: Session, user_id: str):
    return db.query(Questionnaire).filter(Questionnaire.user_id == user_id).first()

def update_questionnaire(db: Session, user_id: str, data: QuestionnaireCreate):
    db_obj = db.query(Questionnaire).filter(Questionnaire.user_id == user_id).first()
    if not db_obj:
        return None
    for field, value in data.dict().items():
        if isinstance(value, list):
            setattr(db_obj, field, ",".join(value))
        else:
            setattr(db_obj, field, value)
    db.commit()
    db.refresh(db_obj)
    return db_obj

def delete_questionnaire(db: Session, user_id: str):
    db_obj = db.query(Questionnaire).filter(Questionnaire.user_id == user_id).first()
    if not db_obj:
        return False
    db.delete(db_obj)
    db.commit()
    return True