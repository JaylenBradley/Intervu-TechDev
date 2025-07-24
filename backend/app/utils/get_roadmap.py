import datetime
from google import genai
import json
from dotenv import load_dotenv
import os
import re
from app.core.prompts import roadmap_prompt
from google.genai import types

load_dotenv()
api_key = os.getenv('GEMINI_API_KEY')
genai.api_key = api_key

client = genai.Client(api_key=api_key,)

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

    text = res.text if hasattr(res, "text") else str(res)
    match = re.search(r"\{.*\}", text, re.DOTALL)
    if not match:
        raise ValueError(f"Gemini did not return JSON. Raw output:\n{text}")
    json_str = match.group(0)
    try:
        roadmap_json = json.loads(json_str)
    except Exception as e:
        raise ValueError(f"Failed to parse Gemini output as JSON. Error: {e}\nRaw output:\n{text}")
    return {"roadmap": roadmap_json}