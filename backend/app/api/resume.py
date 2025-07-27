from fastapi import APIRouter, UploadFile, File, HTTPException, Depends, Form
from starlette.responses import FileResponse
from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.schemas.resume import ResumeImproveResponse, ResumeFeedbackResponse, ResumeCreate, ResumeResponse, ResumeTailorRequest, ResumeTailorResponse
from app.crud.resume import upsert_resume, get_resume
from app.core.prompts import improve_resume_prompt, feedback_resume_prompt, parse_resume_prompt, tailor_resume_prompt
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
            max_output_tokens=8000
        ),
        contents=prompt
    )
    
    # Parse the feedback to extract structured data
    structured_feedback = parse_feedback_response(response.text)
    
    # Add debugging info
    print(f"Raw feedback length: {len(response.text)}")
    print(f"Structured feedback items: {len(structured_feedback)}")
    print(f"First few lines of raw feedback: {response.text[:500]}")
    
    # Debug: Print the structured feedback items
    for i, item in enumerate(structured_feedback):
        print(f"Item {i}: {item}")
    
    return {
        "feedback": response.text or "",
        "structured_feedback": structured_feedback
    }

def parse_feedback_response(feedback_text: str) -> list:
    """Parse the AI feedback response to extract structured feedback items."""
    import re
    
    if not feedback_text:
        return []
    
    # Use a more robust approach to find all Original: sections
    pattern = r'Original:\s*([^\n]+)\s*Grade:\s*([^\n]+)\s*Feedback:\s*([^\n]+(?:\n(?!- Option)[^\n]+)*)\s*(- Option 1:[^\n]+(?:\n(?!- Option)[^\n]+)*)\s*(- Option 2:[^\n]+(?:\n(?!Original:)[^\n]+)*)'
    
    matches = re.findall(pattern, feedback_text, re.DOTALL)
    items = []
    
    for match in matches:
        original_text = match[0].strip()
        grade = match[1].strip()
        feedback = match[2].strip()
        option1 = match[3].replace('- Option 1:', '').strip()
        option2 = match[4].replace('- Option 2:', '').strip()
        
        # Remove bullet points from original text
        original_text = re.sub(r'^[•\-]\s*', '', original_text)
        original_text = re.sub(r'^\s*[•\-]\s*', '', original_text)
        original_text = original_text.strip()
        
        # Skip items that are just intro text
        original_lower = original_text.lower()
        if ('detailed analysis' in original_lower or 
            'here\'s' in original_lower or
            'analysis of' in original_lower):
            continue
        
        # Clean up options
        complete_options = []
        for option in [option1, option2]:
            option_text = option.strip()
            if (len(option_text) > 15 and 
                not option_text.endswith('...') and 
                not option_text.endswith('..') and
                not option_text.endswith('etc') and
                not option_text.endswith('etc.')):
                complete_options.append(option_text)
        
        if len(complete_options) >= 2:
            items.append({
                "original": original_text,
                "grade": grade,
                "feedback": feedback,
                "options": complete_options
            })
    
    return items

@router.post("/resume/tailor", response_model=ResumeTailorResponse)
async def tailor_resume(request: ResumeTailorRequest, db: Session = Depends(get_db)):
    db_obj = get_resume(db, request.user_id)
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
    prompt = tailor_resume_prompt(text, request.job_description)
    response = client.models.generate_content(
        model="gemini-2.5-flash",
        config=types.GenerateContentConfig(temperature=0.2),
        contents=prompt
    )
    
    try:
        parsed_data = json.loads(response.text)
    except Exception as e:
        # Fallback: Try to clean the response and parse again
        cleaned_response = response.text.strip()
        # Remove any markdown formatting
        if cleaned_response.startswith('```json'):
            cleaned_response = cleaned_response[7:]
        if cleaned_response.endswith('```'):
            cleaned_response = cleaned_response[:-3]
        cleaned_response = cleaned_response.strip()
        
        try:
            parsed_data = json.loads(cleaned_response)
        except Exception as e2:
            raise HTTPException(status_code=500, detail=f"Failed to parse tailored resume: {str(e)}")
    
    return {"tailored_resume": json.dumps(parsed_data)}

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