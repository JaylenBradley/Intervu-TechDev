from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.schemas.questionnaire import QuestionnaireCreate, QuestionnaireResponse
from app.crud.questionnaire import (
    upsert_questionnaire,
    get_questionnaire,
    update_questionnaire,
    delete_questionnaire,
)

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def to_list(val):
    if not val:
        return []
    if isinstance(val, list):
        return val
    return [s.strip() for s in val.split(",") if s.strip()]

def questionnaire_to_response(db_obj):
    return QuestionnaireResponse(
        user_id=db_obj.user_id,
        career_goal=db_obj.career_goal,
        major=to_list(db_obj.major),
        minor=to_list(db_obj.minor),
        education_level=db_obj.education_level,
        interests=to_list(db_obj.interests),
        institution=db_obj.institution,
        target_companies=to_list(db_obj.target_companies),
        skills=to_list(db_obj.skills),
        certifications=to_list(db_obj.certifications),
        projects=to_list(db_obj.projects),
        experience=to_list(db_obj.experience),
        timeline=db_obj.timeline,
        learning_preference=db_obj.learning_preference,
        available_hours_per_week=db_obj.available_hours_per_week,
    )

@router.post("/questionnaire", response_model=QuestionnaireResponse)
def submit_questionnaire(data: QuestionnaireCreate, db: Session = Depends(get_db)):
    db_obj = upsert_questionnaire(db, data)
    return questionnaire_to_response(db_obj)

@router.get("/questionnaire/{user_id}", response_model=QuestionnaireResponse)
def read_questionnaire(user_id: int, db: Session = Depends(get_db)):
    db_obj = get_questionnaire(db, user_id)
    if not db_obj:
        raise HTTPException(status_code=404, detail="Questionnaire not found")
    return questionnaire_to_response(db_obj)

@router.patch("/questionnaire/{user_id}", response_model=QuestionnaireResponse)
def patch_questionnaire_endpoint(user_id: int, data: QuestionnaireCreate, db: Session = Depends(get_db)):
    db_obj = update_questionnaire(db, user_id, data)
    if not db_obj:
        raise HTTPException(status_code=404, detail="Questionnaire not found")
    return questionnaire_to_response(db_obj)

@router.delete("/questionnaire/{user_id}")
def delete_questionnaire_endpoint(user_id: int, db: Session = Depends(get_db)):
    success = delete_questionnaire(db, user_id)
    if not success:
        raise HTTPException(status_code=404, detail="Questionnaire not found")
    return {"detail": "Questionnaire deleted"}