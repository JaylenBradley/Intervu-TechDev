from fastapi import APIRouter, UploadFile, File, HTTPException
from starlette.responses import FileResponse
from app.schemas.resume import ResumeImproveResponse, ResumeFeedbackResponse
from PyPDF2 import PdfReader
import os
import tempfile
from google import genai
from google.genai import types
from app.core.prompts import improve_resume_prompt, feedback_resume_prompt
from app.utils.save_resume import save_text_as_pdf, save_text_as_docx

router = APIRouter()
genai.api_key = os.getenv('GEMINI_API_KEY')
client = genai.Client(api_key=genai.api_key)

def extract_text_from_pdf_file(file: UploadFile) -> str:
    reader = PdfReader(file.file)
    text = ""
    for page in reader.pages:
        text += (page.extract_text() or "") + "\n"
    return text

@router.post("/resume/improve", response_model=ResumeImproveResponse)
async def improve_resume(file: UploadFile = File(...)):
    text = extract_text_from_pdf_file(file)
    prompt = improve_resume_prompt(text)
    response = client.models.generate_content(
        model="gemini-2.5-flash",
        config=types.GenerateContentConfig(temperature=0.3),
        contents=prompt
    )
    return {"improved_resume": response.text}

@router.post("/resume/feedback", response_model=ResumeFeedbackResponse)
async def feedback_resume(file: UploadFile = File(...)):
    try:
        text = extract_text_from_pdf_file(file)
        
        # Limit text length to prevent timeouts
        if len(text) > 30000:  # 30KB limit - more reasonable
            text = text[:30000]
        
        prompt = feedback_resume_prompt(text)
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            config=types.GenerateContentConfig(
                temperature=0.3,
                max_output_tokens=6000  # Limit output to prevent timeouts
            ),
            contents=prompt
        )
        print(f"Feedback response: {response.text[:500]}...")  # Log first 500 chars
        print(f"Response length: {len(response.text)}")
        result = {"feedback": response.text}
        print(f"Returning result: {result}")
        return result
    except Exception as e:
        print(f"Error in feedback_resume: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to generate feedback. Please try again.")

@router.post("/resume/export")
async def export_resume(file: UploadFile = File(...), format: str = "pdf"):
    text = extract_text_from_pdf_file(file)
    improved = client.models.generate_content(
        model="gemini-2.5-flash",
        config=types.GenerateContentConfig(temperature=0.3),
        contents=improve_resume_prompt(text)
    ).text

    with tempfile.NamedTemporaryFile(delete=False, suffix=f".{format}") as tmp:
        if format == "pdf":
            save_text_as_pdf(improved, tmp.name)
        elif format == "docx":
            save_text_as_docx(improved, tmp.name)
        else:
            raise HTTPException(status_code=400, detail="Invalid format")
        return FileResponse(tmp.name, filename=f"improved_resume.{format}")