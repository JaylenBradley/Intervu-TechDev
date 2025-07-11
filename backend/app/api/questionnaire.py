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

@router.post("/questionnaire", response_model=QuestionnaireResponse)
def submit_questionnaire(data: QuestionnaireCreate, db: Session = Depends(get_db)):
    db_obj = upsert_questionnaire(db, data)
    return QuestionnaireResponse(
        **data.dict(),
        passions=db_obj.passions.split(",") if db_obj.passions else [],
        target_companies=db_obj.target_companies.split(",") if db_obj.target_companies else [],
        skills=db_obj.skills.split(",") if db_obj.skills else [],
        certifications=db_obj.certifications.split(",") if db_obj.certifications else [],
    )

@router.get("/questionnaire/{user_id}", response_model=QuestionnaireResponse)
def read_questionnaire(user_id: str, db: Session = Depends(get_db)):
    db_obj = get_questionnaire(db, user_id)
    if not db_obj:
        raise HTTPException(status_code=404, detail="Questionnaire not found")
    return QuestionnaireResponse(
        user_id=db_obj.user_id,
        career_goal=db_obj.career_goal,
        major=db_obj.major,
        education_level=db_obj.education_level,
        passions=db_obj.passions.split(",") if db_obj.passions else [],
        institution=db_obj.institution,
        target_companies=db_obj.target_companies.split(",") if db_obj.target_companies else [],
        skills=db_obj.skills.split(",") if db_obj.skills else [],
        certifications=db_obj.certifications.split(",") if db_obj.certifications else [],
        projects=db_obj.projects,
        experience=db_obj.experience,
        timeline=db_obj.timeline,
        learning_preference=db_obj.learning_preference,
        available_hours_per_week=db_obj.available_hours_per_week,
    )

@router.put("/questionnaire/{user_id}", response_model=QuestionnaireResponse)
def update_questionnaire_endpoint(user_id: str, data: QuestionnaireCreate, db: Session = Depends(get_db)):
    db_obj = update_questionnaire(db, user_id, data)
    if not db_obj:
        raise HTTPException(status_code=404, detail="Questionnaire not found")
    return QuestionnaireResponse(
        **data.dict(),
        passions=db_obj.passions.split(",") if db_obj.passions else [],
        target_companies=db_obj.target_companies.split(",") if db_obj.target_companies else [],
        skills=db_obj.skills.split(",") if db_obj.skills else [],
        certifications=db_obj.certifications.split(",") if db_obj.certifications else [],
    )

@router.delete("/questionnaire/{user_id}")
def delete_questionnaire_endpoint(user_id: str, db: Session = Depends(get_db)):
    success = delete_questionnaire(db, user_id)
    if not success:
        raise HTTPException(status_code=404, detail="Questionnaire not found")
    return {"detail": "Questionnaire deleted"}