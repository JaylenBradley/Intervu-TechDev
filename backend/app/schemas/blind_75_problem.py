from typing import List
from pydantic import BaseModel

class Line(BaseModel):
    text: str
    indentLevel: int

class Problem(BaseModel):
    title: str
    type: str
    difficulty: str
    space: str
    time: str
    prompt: str
    solution: List[Line]

class WrongSubmission(BaseModel):
    user_id: int
    title: str
    problem_type: str
    difficulty: str
