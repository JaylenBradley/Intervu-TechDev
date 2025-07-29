import os
import tempfile
from fastapi import APIRouter, UploadFile, File
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
from app.utils.speech_to_text import transcribe_audio

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

@router.post("/behavioral-prep/transcribe")
async def transcribe_audio_endpoint(audio: UploadFile = File(...)):
    # Create a temporary file with proper cross-platform path
    with tempfile.NamedTemporaryFile(delete=False, suffix=f"_{audio.filename}") as temp_file:
        temp_path = temp_file.name
        temp_file.write(await audio.read())
    
    try:
        transcript = transcribe_audio(temp_path)
        return {"transcript": transcript}
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)