from fastapi import APIRouter, UploadFile, File, HTTPException, Depends, Form
from starlette.responses import FileResponse
from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.schemas.resume import ResumeImproveResponse, ResumeFeedbackResponse, ResumeCreate, ResumeResponse, ResumeTailorRequest, ResumeTailorResponse
from app.crud.resume import upsert_resume, get_resume
from app.core.prompts import improve_resume_prompt, feedback_resume_prompt, parse_resume_prompt, tailor_resume_prompt
from app.utils.save_resume import save_text_as_pdf, save_text_as_docx
from app.utils.resume_parser import parse_feedback_response
from PyPDF2 import PdfReader
import os
import tempfile
import json
from google import genai
from google.genai import types

# Constants
MAX_TEXT_LENGTH = 30000
DEFAULT_TEMPERATURE = 0.3
MAX_TOKENS = 8000
GEMINI_MODEL = "gemini-2.5-flash"

genai.api_key = os.getenv('GEMINI_API_KEY')
client = genai.Client(api_key=genai.api_key)

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def extract_text_from_pdf_file(file: UploadFile) -> str:
    """Extract text from uploaded PDF file."""
    reader = PdfReader(file.file)
    text = ""
    for page in reader.pages:
        text += (page.extract_text() or "") + "\n"
    return text

def extract_text_from_stored_pdf(file_data: bytes) -> str:
    """Extract text from stored PDF data."""
    with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
        tmp.write(file_data)
        tmp.flush()
        tmp_path = tmp.name
    try:
        reader = PdfReader(tmp_path)
        text = ""
        for page in reader.pages:
            text += page.extract_text() or ""
        return text
    except Exception as e:
        raise HTTPException(status_code=400, detail="Resume file is corrupted or not a valid PDF. Please re-upload.")

def get_resume_or_404(user_id: int, db: Session):
    """Get resume from database or raise 404 if not found."""
    db_obj = get_resume(db, user_id)
    if not db_obj:
        raise HTTPException(status_code=404, detail="Resume not found")
    return db_obj

def call_gemini_api(prompt: str, temperature: float = DEFAULT_TEMPERATURE, max_tokens: int = None) -> str:
    """Call Gemini API with consistent configuration."""
    config = types.GenerateContentConfig(temperature=temperature)
    if max_tokens:
        config.max_output_tokens = max_tokens
    
    response = client.models.generate_content(
        model=GEMINI_MODEL,
        config=config,
        contents=prompt
    )
    return response.text

def parse_json_response(response_text: str, error_message: str = "Failed to parse response") -> dict:
    """Parse JSON response from Gemini with fallback cleaning."""
    try:
        return json.loads(response_text)
    except Exception as e:
        # Fallback: Try to clean the response and parse again
        cleaned_response = response_text.strip()
        # Remove any markdown formatting
        if cleaned_response.startswith('```json'):
            cleaned_response = cleaned_response[7:]
        if cleaned_response.endswith('```'):
            cleaned_response = cleaned_response[:-3]
        cleaned_response = cleaned_response.strip()
        
        try:
            return json.loads(cleaned_response)
        except Exception as e2:
            raise HTTPException(status_code=500, detail=f"{error_message}: {str(e)}")

@router.post("/resume/upload", response_model=ResumeResponse)
async def upload_and_parse_resume(
    user_id: int = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    # Extract text from PDF
    text = extract_text_from_pdf_file(file)
    file.file.seek(0)  # Reset pointer so the full file is saved
    
    # Parse with Gemini
    prompt = parse_resume_prompt(text)
    response_text = call_gemini_api(prompt, temperature=0.0)
    
    parsed_data = parse_json_response(response_text, "Failed to parse resume")
    
    # Store in DB
    db_obj = upsert_resume(
        db=db,
        user_id=user_id,
        file_name=file.filename,
        file_data=await file.read(),
        parsed_data=parsed_data
    )
    return db_obj

@router.get("/resume/me", response_model=ResumeResponse)
async def get_my_resume(user_id: int, db: Session = Depends(get_db)):
    return get_resume_or_404(user_id, db)

@router.get("/resume/improve", response_model=ResumeImproveResponse)
async def improve_resume(user_id: int, db: Session = Depends(get_db)):
    db_obj = get_resume_or_404(user_id, db)
    
    text = extract_text_from_stored_pdf(db_obj.file_data)
    prompt = improve_resume_prompt(text)
    response_text = call_gemini_api(prompt)
    
    return {"improved_resume": response_text}

@router.get("/resume/feedback", response_model=ResumeFeedbackResponse)
async def feedback_resume(user_id: int, db: Session = Depends(get_db)):
    db_obj = get_resume_or_404(user_id, db)
    
    text = extract_text_from_stored_pdf(db_obj.file_data)
    
    # Truncate text if too long
    if len(text) > MAX_TEXT_LENGTH:
        text = text[:MAX_TEXT_LENGTH]
    
    prompt = feedback_resume_prompt(text)
    response_text = call_gemini_api(prompt, max_tokens=MAX_TOKENS)
    
    # Parse the feedback to extract structured data using centralized parser
    structured_feedback = parse_feedback_response(response_text)
    
    # Add debugging info
    print(f"Raw feedback length: {len(response_text)}")
    print(f"Structured feedback items: {len(structured_feedback)}")
    print(f"First few lines of raw feedback: {response_text[:500]}")
    
    # Debug: Print the structured feedback items
    for i, item in enumerate(structured_feedback):
        print(f"Item {i}: {item}")
    
    return {
        "feedback": response_text or "",
        "structured_feedback": structured_feedback
    }

@router.post("/resume/tailor", response_model=ResumeTailorResponse)
async def tailor_resume(request: ResumeTailorRequest, db: Session = Depends(get_db)):
    db_obj = get_resume_or_404(request.user_id, db)
    
    text = extract_text_from_stored_pdf(db_obj.file_data)
    prompt = tailor_resume_prompt(text, request.job_description)
    response_text = call_gemini_api(prompt, temperature=0.2)
    
    parsed_data = parse_json_response(response_text, "Failed to parse tailored resume")
    
    return {"tailored_resume": json.dumps(parsed_data)}

@router.get("/resume/export")
async def export_resume(user_id: int, format: str = "pdf", db: Session = Depends(get_db)):
    db_obj = get_resume_or_404(user_id, db)
    
    # Extract text and improve it
    text = extract_text_from_stored_pdf(db_obj.file_data)
    improved_text = call_gemini_api(improve_resume_prompt(text))
    
    # Export to requested format
    with tempfile.NamedTemporaryFile(delete=False, suffix=f".{format}") as out_tmp:
        if format == "pdf":
            save_text_as_pdf(improved_text, out_tmp.name)
        elif format == "docx":
            save_text_as_docx(improved_text, out_tmp.name)
        else:
            raise HTTPException(status_code=400, detail="Invalid format")
        return FileResponse(out_tmp.name, filename=f"improved_resume.{format}")