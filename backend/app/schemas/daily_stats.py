from pydantic import BaseModel
from datetime import date
from typing import Optional

class DailyStatBase(BaseModel):
    goal: Optional[int] = None
    answered: int = 0
    score: int = 0
    streak: int = 0

class DailyStatCreate(DailyStatBase):
    user_id: int
    date: date
    goal: int = 0

class DailyStatUpdate(BaseModel):
    goal: Optional[int] = None
    answered: Optional[int] = None
    score: Optional[int] = None
    streak: Optional[int] = None

class GoalUpdateRequest(BaseModel):
    goal: int

class DailyStatResponse(DailyStatBase):
    id: str
    user_id: int
    date: date

    class Config:
        orm_mode = True
