import os
import json
import datetime
from dotenv import load_dotenv
from google import genai
from google.genai import types
from app.core.prompts import job_description_roadmap_prompt

load_dotenv()
api_key = os.getenv('GEMINI_API_KEY')
genai.api_key = api_key

client = genai.Client(api_key=api_key)

def get_job_description_roadmap(profile, resume, job_description, current_date=None):
    if not current_date:
        current_date = datetime.datetime.now().strftime("%B %d, %Y")
    prompt = job_description_roadmap_prompt(profile, resume, job_description, current_date)
    res = client.models.generate_content(
        model="gemini-2.5-flash",
        config=types.GenerateContentConfig(
            system_instruction="You are a professional career roadmap assistant"
        ),
        contents=prompt
    )

    job_description_roadmap_json = json.loads(res.text if hasattr(res, "text") else str(res))
    return job_description_roadmap_json