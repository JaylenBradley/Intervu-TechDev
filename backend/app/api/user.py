from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from app.core.database import SessionLocal
from app.models.user import User
from app.schemas.user import UserCreate, UserResponse
from app.crud.user import create_user, get_user, update_user, delete_user, get_user_by_firebase_id

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/user", response_model=UserResponse)
def create_user_route(data: UserCreate, db: Session = Depends(get_db)):
    try:
        user = create_user(db, data)
        return user
    except IntegrityError:
        db.rollback()
        existing = get_user_by_firebase_id(db, data.firebase_id)
        if existing:
            return existing
        raise HTTPException(status_code=409, detail="User already exists")

@router.post("/user/{id}/questionnaire-complete")
def set_questionnaire_complete(id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.questionnaire_completed = True
    db.commit()
    db.refresh(user)
    return {"completed": True}

@router.get("/users", response_model=list[UserResponse])
def read_users(db: Session = Depends(get_db)):
    users = db.query(User).all()
    return users

@router.get("/user/{id}", response_model=UserResponse)
def read_user(id: int, db: Session = Depends(get_db)):
    db_user = get_user(db, id)
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    return db_user

@router.get("/user/firebase/{firebase_id}", response_model=UserResponse)
def get_user_by_firebase_id_route(firebase_id: str, db: Session = Depends(get_db)):
    db_user = get_user_by_firebase_id(db, firebase_id)
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    return db_user

@router.get("/user/{id}/questionnaire-status")
def get_questionnaire_status(id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {"completed": user.questionnaire_completed}

@router.patch("/user/{id}", response_model=UserResponse)
def patch_user_endpoint(id: int, user: UserCreate, db: Session = Depends(get_db)):
    db_user = update_user(db, id, user)
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    return db_user

@router.delete("/user/{id}")
def delete_user_endpoint(id: int, db: Session = Depends(get_db)):
    success = delete_user(db, id)
    if not success:
        raise HTTPException(status_code=404, detail="User not found")
    return {"detail": "User deleted"}