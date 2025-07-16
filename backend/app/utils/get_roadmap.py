import os
from dotenv import load_dotenv
import json
import datetime
from google import genai
from google.genai import types
from app.core.prompts import roadmap_prompt

load_dotenv()
api_key = os.getenv('GEMINI_API_KEY')
genai.api_key = api_key

client = genai.Client(
    api_key=api_key,
)

# Generate roadmap based on questionnaire responses
def get_roadmap(questionnaire_res, current_date = datetime.datetime.now().strftime("%B %d, %Y")):
    formatted_prompt = roadmap_prompt(
        json.dumps(questionnaire_res, indent=2),
        current_date
    )
    res = client.models.generate_content(
        model="gemini-2.5-flash",
        config=types.GenerateContentConfig(
          system_instruction="You are a professional career roadmap assistant"
        ),
        contents=formatted_prompt
    )

    roadmap_text = res.text if hasattr(res, "text") else str(res)

    return {"roadmap": roadmap_text}