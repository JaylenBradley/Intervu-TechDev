from pydantic import BaseModel
from typing import List, Optional
from enum import Enum

class DifficultyLevel(str, Enum):
    EASY = "easy"
    MEDIUM = "medium"
    HARD = "hard"

class TechnicalInterviewRequest(BaseModel):
    user_id: int
    target_role: str
    target_company: str
    difficulty: DifficultyLevel
    num_questions: int

class LeetCodeQuestion(BaseModel):
    id: str
    title: str
    description: str
    difficulty: DifficultyLevel
    category: str  # e.g., "arrays", "strings", "trees", "dynamic programming"
    hints: List[str]
    expected_approach: str
    time_complexity: str
    space_complexity: str

class TechnicalInterviewResponse(BaseModel):
    questions: List[LeetCodeQuestion]
    session_id: str

class UserAnswer(BaseModel):
    question_id: str
    question: str
    user_answer: str
    target_company: str
    difficulty: DifficultyLevel

class AnswerFeedback(BaseModel):
    question_id: str
    feedback: str
    score: float  # 0-100
    suggestions: List[str]
    time_complexity: str
    space_complexity: str 