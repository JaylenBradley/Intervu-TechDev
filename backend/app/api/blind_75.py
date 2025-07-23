import random
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.schemas.blind_75 import (
    Problem,
    Line,
    WrongSubmission,
)
from app.models.blind75_problem import Blind75Problem         
from app.models.blind75 import Blind75 as Blind75Model        
from app.models.user import User

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


router = APIRouter(prefix="/blind75", tags=["Blind75"])

@router.get("/random", response_model=Problem)
def get_random_problem(db: Session = Depends(get_db)):
    count = db.query(func.count(Blind75Problem.id)).scalar()
    if count == 0:
        raise HTTPException(
            status_code=500,
            detail="Problem bank not initialised. POST /blind75/seed first.",
        )

    row = (
        db.query(Blind75Problem)
        .offset(random.randint(0, count - 1))
        .limit(1)
        .one()
    )

    return Problem(
        title=row.title,
        type=row.problem_type,
        difficulty=row.difficulty,
        space=row.space_complexity,
        time=row.time_complexity,
        prompt=row.prompt,
        solution=[Line(**line) for line in row.solution],
    )


@router.post("/wrong", status_code=201)
def submit_wrong_problem(
    submission: WrongSubmission,
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.id == submission.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    db.add(
        Blind75Model(
            user_id=submission.user_id,
            title=submission.title,
            problem_type=submission.problem_type,
            difficulty=submission.difficulty,
        )
    )
    db.commit()
    return {"detail": "Wrong problem recorded"}
