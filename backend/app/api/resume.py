from fastapi import APIRouter, UploadFile, File, HTTPException, Depends, Form
from starlette.responses import FileResponse
from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.schemas.resume import ResumeImproveResponse, ResumeFeedbackResponse, ResumeCreate, ResumeResponse
from app.crud.resume import upsert_resume, get_resume
from app.core.prompts import improve_resume_prompt, feedback_resume_prompt, parse_resume_prompt
from app.utils.save_resume import save_text_as_pdf, save_text_as_docx
from PyPDF2 import PdfReader
import os
import tempfile
import json
from google import genai
from google.genai import types

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
    reader = PdfReader(file.file)
    text = ""
    for page in reader.pages:
        text += (page.extract_text() or "") + "\n"
    return text

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
    response = client.models.generate_content(
        model="gemini-2.5-flash",
        config=types.GenerateContentConfig(temperature=0.0),
        contents=prompt
    )
    try:
        parsed_data = json.loads(response.text)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to parse resume: {str(e)}")
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
    db_obj = get_resume(db, user_id)
    if not db_obj:
        raise HTTPException(status_code=404, detail="Resume not found")
    return db_obj

@router.get("/resume/improve", response_model=ResumeImproveResponse)
async def improve_resume(user_id: int, db: Session = Depends(get_db)):
    db_obj = get_resume(db, user_id)
    if not db_obj:
        raise HTTPException(status_code=404, detail="Resume not found")
    import tempfile
    from PyPDF2 import PdfReader
    with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
        tmp.write(db_obj.file_data)
        tmp.flush()
        tmp_path = tmp.name
    try:
        reader = PdfReader(tmp_path)
        text = ""
        for page in reader.pages:
            text += page.extract_text() or ""
    except Exception as e:
        raise HTTPException(status_code=400, detail="Resume file is corrupted or not a valid PDF. Please re-upload.")
    prompt = improve_resume_prompt(text)
    response = client.models.generate_content(
        model="gemini-2.5-flash",
        config=types.GenerateContentConfig(temperature=0.3),
        contents=prompt
    )
    return {"improved_resume": response.text}

@router.get("/resume/feedback", response_model=ResumeFeedbackResponse)
async def feedback_resume(user_id: int, db: Session = Depends(get_db)):
    db_obj = get_resume(db, user_id)
    if not db_obj:
        raise HTTPException(status_code=404, detail="Resume not found")
    import tempfile
    from PyPDF2 import PdfReader
    with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
        tmp.write(db_obj.file_data)
        tmp.flush()
        tmp_path = tmp.name
    try:
        reader = PdfReader(tmp_path)
        text = ""
        for page in reader.pages:
            text += page.extract_text() or ""
    except Exception as e:
        raise HTTPException(status_code=400, detail="Resume file is corrupted or not a valid PDF. Please re-upload.")
    if len(text) > 30000:
        text = text[:30000]
    prompt = feedback_resume_prompt(text)
    response = client.models.generate_content(
        model="gemini-2.5-flash",
        config=types.GenerateContentConfig(
            temperature=0.3,
            max_output_tokens=6000
        ),
        contents=prompt
    )
    return {"feedback": response.text or ""}

@router.get("/resume/export")
async def export_resume(user_id: int, format: str = "pdf", db: Session = Depends(get_db)):
    db_obj = get_resume(db, user_id)
    if not db_obj:
        raise HTTPException(status_code=404, detail="Resume not found")
    # Use the stored file_data
    with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
        tmp.write(db_obj.file_data)
        tmp.flush()
        reader = PdfReader(tmp.name)
        text = ""
        for page in reader.pages:
            text += (page.extract_text() or "") + "\n"
    improved = client.models.generate_content(
        model="gemini-2.5-flash",
        config=types.GenerateContentConfig(temperature=0.3),
        contents=improve_resume_prompt(text)
    ).text
    with tempfile.NamedTemporaryFile(delete=False, suffix=f".{format}") as out_tmp:
        if format == "pdf":
            save_text_as_pdf(improved, out_tmp.name)
        elif format == "docx":
            save_text_as_docx(improved, out_tmp.name)
        else:
            raise HTTPException(status_code=400, detail="Invalid format")
        return FileResponse(out_tmp.name, filename=f"improved_resume.{format}")