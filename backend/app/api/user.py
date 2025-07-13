from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.schemas.user import UserCreate, UserResponse
from app.crud.user import create_user, get_user, update_user, delete_user

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/user", response_model=UserResponse)
def create_user_endpoint(user: UserCreate, db: Session = Depends(get_db)):
    db_user = create_user(db, user)
    return db_user

@router.get("/user/{id}", response_model=UserResponse)
def read_user(id: int, db: Session = Depends(get_db)):
    db_user = get_user(db, id)
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    return db_user

@router.put("/user/{id}", response_model=UserResponse)
def update_user_endpoint(id: int, user: UserCreate, db: Session = Depends(get_db)):
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