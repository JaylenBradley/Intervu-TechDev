from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.schemas.interview import (
    TechnicalInterviewRequest,
    TechnicalInterviewResponse,
    LeetCodeQuestion,
    UserAnswer,
    AnswerFeedback
)
from app.crud.questionnaire import get_questionnaire
from app.utils.technical_interview import generate_leetcode_questions, evaluate_answer
import os
from google import genai
from google.genai import types

router = APIRouter()
genai.api_key = os.getenv('GEMINI_API_KEY')
client = genai.Client(api_key=genai.api_key)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/interview/technical/generate", response_model=TechnicalInterviewResponse)
def generate_technical_interview(
    request: TechnicalInterviewRequest,
    db: Session = Depends(get_db)
):
    """Generate LeetCode questions based on user profile and preferences"""
    try:
        # Get user's questionnaire data
        questionnaire = get_questionnaire(db, request.user_id)
        if not questionnaire:
            raise HTTPException(status_code=404, detail="Questionnaire not found")
        
        # Generate questions using Gemini
        questions = generate_leetcode_questions(
            user_profile=questionnaire,
            target_company=request.target_company,
            difficulty=request.difficulty,
            num_questions=request.num_questions
        )
        
        return TechnicalInterviewResponse(
            questions=questions,
            session_id=f"session_{request.user_id}_{request.target_company}"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate questions: {str(e)}")

@router.post("/interview/technical/evaluate", response_model=AnswerFeedback)
def evaluate_technical_answer(answer: UserAnswer):
    """Evaluate user's answer to a LeetCode question"""
    try:
        feedback = evaluate_answer(
            question=answer.question,
            user_answer=answer.user_answer,
            target_company=answer.target_company,
            difficulty=answer.difficulty
        )
        
        return AnswerFeedback(
            question_id=answer.question_id,
            feedback=feedback["feedback"],
            score=feedback["score"],
            suggestions=feedback["suggestions"],
            time_complexity=feedback["time_complexity"],
            space_complexity=feedback["space_complexity"]
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to evaluate answer: {str(e)}") 