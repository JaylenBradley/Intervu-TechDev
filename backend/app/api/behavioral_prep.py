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
        req.target_role, req.seniority, req.company, req.question, req.answer, req.difficulty, req.pause_analysis
    )
    return BehavioralFeedbackResponse(feedback=feedback)

@router.post("/behavioral-prep/transcribe")
async def transcribe_audio_endpoint(audio: UploadFile = File(...)):    
    # Create a temporary file with proper cross-platform path
    with tempfile.NamedTemporaryFile(delete=False, suffix=f"_{audio.filename}") as temp_file:
        temp_path = temp_file.name
        temp_file.write(await audio.read())
    
    try:
        transcript, pauses = transcribe_audio(temp_path)
        total_pauses = len(pauses)
        long_pauses = len([p for p in pauses if p["duration"] > 2.0])
        avg_pause_duration = round(sum(p["duration"] for p in pauses) / max(total_pauses, 1), 2) if pauses else 0
        
        return {
            "transcript": transcript,
            "pause_analysis": {
                "total_pauses": total_pauses,
                "long_pauses": long_pauses,
                "average_pause_duration": avg_pause_duration,
                "pauses": pauses  
            }
        }
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)