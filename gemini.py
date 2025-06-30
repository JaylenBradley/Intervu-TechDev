import os
from dotenv import load_dotenv
from google import genai
from google.genai import types
import json

load_dotenv()
api_key = os.getenv('GENAI_API_KEY')
genai.api_key = api_key

client = genai.Client(
    api_key=api_key,
)

roadmap_prompt = """
You are a career roadmap assistant helping users improve their chances of landing their dream job.

Here is the user's profile data:
{profile}

Using this information, generate a career plan that includes the following:
1. A personalized roadmap outlining what steps they need to take to reach their target role (including certifications, classes, internships, and technical projects).
2. Resume feedback with specific suggestions to improve their resume based on their current skills and experience.
3. A list of technical and soft skills they should develop to match the expectations of their target companies.
4. A list of suggested YouTube search terms that can help them learn the required skills or prepare for interviews. The search terms should be based on their passions, learning preferences, and skills gaps.
5. A list of job titles they could apply for right now given their current background.

All output should be clear, actionable, and written as if you're coaching a motivated student trying to break into the tech industry. Use bullet points where appropriate. Avoid generic advice; tailor all content to the user's profile and target companies.
"""

def get_roadmap(questionnaire_res):
    formatted_prompt = roadmap_prompt.format(
        profile=json.dumps(questionnaire_res, indent=2)
    )

    res = client.models.generate_content(
        model="gemini-2.5-flash",
        config=types.GenerateContentConfig(
          system_instruction="You are a professional career roadmap assistant"
        ),
        contents=formatted_prompt
    )

    return res