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
    response_data = data.dict()
    response_data["major"] = [s.strip() for s in db_obj.major.split(",") if s.strip()] if db_obj.major else []
    response_data["projects"] = [s.strip() for s in db_obj.projects.split(",") if s.strip()] if db_obj.projects else []
    response_data["experience"] = [s.strip() for s in db_obj.experience.split(",") if s.strip()] if db_obj.experience else []
    response_data["interests"] = [s.strip() for s in db_obj.interests.split(",") if s.strip()] if db_obj.interests else []
    response_data["target_companies"] = [s.strip() for s in db_obj.target_companies.split(",") if s.strip()] if db_obj.target_companies else []
    response_data["skills"] = [s.strip() for s in db_obj.skills.split(",") if s.strip()] if db_obj.skills else []
    response_data["certifications"] = [s.strip() for s in db_obj.certifications.split(",") if s.strip()] if db_obj.certifications else []
    return QuestionnaireResponse(**response_data)

@router.get("/questionnaire/{user_id}", response_model=QuestionnaireResponse)
def read_questionnaire(user_id: int, db: Session = Depends(get_db)):
    db_obj = get_questionnaire(db, user_id)
    if not db_obj:
        raise HTTPException(status_code=404, detail="Questionnaire not found")
    return QuestionnaireResponse(
        user_id=db_obj.user_id,
        career_goal=db_obj.career_goal,
        major=[s.strip() for s in db_obj.major.split(",") if s.strip()] if db_obj.major else [],
        education_level=db_obj.education_level,
        interests=[s.strip() for s in db_obj.interests.split(",") if s.strip()] if db_obj.interests else [],
        institution=db_obj.institution,
        target_companies=[s.strip() for s in db_obj.target_companies.split(",") if s.strip()] if db_obj.target_companies else [],
        skills=[s.strip() for s in db_obj.skills.split(",") if s.strip()] if db_obj.skills else [],
        certifications=[s.strip() for s in db_obj.certifications.split(",") if s.strip()] if db_obj.certifications else [],
        projects=[s.strip() for s in db_obj.projects.split(",") if s.strip()] if db_obj.projects else [],
        experience=[s.strip() for s in db_obj.experience.split(",") if s.strip()] if db_obj.experience else [],
        timeline=db_obj.timeline,
        learning_preference=db_obj.learning_preference,
        available_hours_per_week=db_obj.available_hours_per_week,
    )

@router.patch("/questionnaire/{user_id}", response_model=QuestionnaireResponse)
def patch_questionnaire_endpoint(user_id: int, data: QuestionnaireCreate, db: Session = Depends(get_db)):
    db_obj = update_questionnaire(db, user_id, data)
    if not db_obj:
        raise HTTPException(status_code=404, detail="Questionnaire not found")
    response_data = data.dict()
    response_data["major"] = [s.strip() for s in db_obj.major.split(",") if s.strip()] if db_obj.major else []
    response_data["projects"] = [s.strip() for s in db_obj.projects.split(",") if s.strip()] if db_obj.projects else []
    response_data["experience"] = [s.strip() for s in db_obj.experience.split(",") if s.strip()] if db_obj.experience else []
    response_data["interests"] = [s.strip() for s in db_obj.interests.split(",") if s.strip()] if db_obj.interests else []
    response_data["target_companies"] = [s.strip() for s in db_obj.target_companies.split(",") if s.strip()] if db_obj.target_companies else []
    response_data["skills"] = [s.strip() for s in db_obj.skills.split(",") if s.strip()] if db_obj.skills else []
    response_data["certifications"] = [s.strip() for s in db_obj.certifications.split(",") if s.strip()] if db_obj.certifications else []
    return QuestionnaireResponse(**response_data)

@router.delete("/questionnaire/{user_id}")
def delete_questionnaire_endpoint(user_id: int, db: Session = Depends(get_db)):
    success = delete_questionnaire(db, user_id)
    if not success:
        raise HTTPException(status_code=404, detail="Questionnaire not found")
    return {"detail": "Questionnaire deleted"}