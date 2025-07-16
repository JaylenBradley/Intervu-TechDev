import os
import json
from dotenv import load_dotenv
from google import genai
from google.genai import types
from app.core.prompts import behavioral_questions_prompt, behavioral_feedback_prompt

load_dotenv()
api_key = os.getenv('GEMINI_API_KEY')
genai.api_key = api_key
client = genai.Client(api_key=api_key)

def generate_behavioral_questions(target_role, seniority, company, num_questions, difficulty):
    prompt = behavioral_questions_prompt(target_role, seniority, company, num_questions, difficulty)
    res = client.models.generate_content(
        model="gemini-2.5-flash",
        config=types.GenerateContentConfig(
            system_instruction="You are a professional behavioral interview assistant."
        ),
        contents=prompt
    )
    text = res.text if hasattr(res, "text") else str(res)
    try:
        questions = json.loads(text)
        if isinstance(questions, list):
            return [str(q).strip() for q in questions]
    except Exception:
        questions = [q.strip("0123456789. ").strip() for q in text.strip().split("\n") if q.strip()]
    return questions

def generate_behavioral_feedback(target_role, seniority, company, question, answer, difficulty):
    prompt = behavioral_feedback_prompt(target_role, seniority, company, question, answer, difficulty)
    res = client.models.generate_content(
        model="gemini-2.5-flash",
        config=types.GenerateContentConfig(
            system_instruction="You are a professional behavioral interview assistant."
        ),
        contents=prompt
    )
    feedback = res.text if hasattr(res, "text") else str(res)
    try:
        feedback_json = json.loads(feedback)
        return feedback_json
    except Exception:
        return feedback.strip()