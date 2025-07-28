import random
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.schemas.blind_75_problem import (
    Problem,
    Line,
    WrongSubmission,
)
from app.models.blind75_problem import Blind75Problem         
from app.models.user import User

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


router = APIRouter(prefix="/blind75", tags=["Blind75"])

@router.get("/random", response_model=Problem)
def get_random_problem(difficulty: str = None, db: Session = Depends(get_db)):
    query = db.query(Blind75Problem)
    
    if difficulty and difficulty.lower() != "all":
        query = query.filter(Blind75Problem.difficulty.ilike(f"%{difficulty}%"))
    
    count = query.count()
    if count == 0:
        raise HTTPException(
            status_code=500,
            detail="Problem bank not initialised or no problems found for the specified difficulty.",
        )

    row = (
        query
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

