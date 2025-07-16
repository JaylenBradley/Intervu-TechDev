from fastapi import APIRouter
from app.schemas.behavioral_prep import (
    BehavioralQuestionsRequest,
    BehavioralQuestionsResponse,
    BehavioralFeedbackRequest,
    BehavioralFeedbackResponse,
)
from app.utils.behavioral_prep import (
    generate_behavioral_questions,
    generate_behavioral_feedback,
)

router = APIRouter()

@router.post("/behavioral-prep/questions", response_model=BehavioralQuestionsResponse)
async def get_behavioral_questions(req: BehavioralQuestionsRequest):
    questions = generate_behavioral_questions(
        req.target_role, req.seniority, req.company, req.num_questions, req.difficulty
    )
    return BehavioralQuestionsResponse(questions=questions)

@router.post("/behavioral-prep/feedback", response_model=BehavioralFeedbackResponse)
async def get_behavioral_feedback(req: BehavioralFeedbackRequest):
    feedback = generate_behavioral_feedback(
        req.target_role, req.seniority, req.company, req.question, req.answer, req.difficulty
    )
    return BehavioralFeedbackResponse(feedback=feedback)