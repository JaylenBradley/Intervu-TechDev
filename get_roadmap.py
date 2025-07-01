import os
from dotenv import load_dotenv
import json
import datetime
from google import genai
from google.genai import types

load_dotenv()
api_key = os.getenv('GENAI_API_KEY')
genai.api_key = api_key

client = genai.Client(
    api_key=api_key,
)

roadmap_prompt = """
You are a professional; career roadmap assistant helping users improve their chances of landing their dream job.

Here is the user's profile data:
{profile}


Instructions for formatting:
Use only hyphens (-) or incrementing numbers (1., 2., etc.) for bullet points to keep formatting clean.
-When using numbered lists, restart numbering for each new section — do not repeat the same number across sections.
-Avoid using Markdown formatting entirely: do not use asterisks (*) or hash symbols (#) at all in your output.
-Section titles should be written in ALL CAPS, followed by a colon.
For specific goals that should be parsed and stored in the database:
-Format them as a list titled Specific Goals with one goal per line, each preceded by a hyphen (-).
-Do not include any dates, timeframes, or extra commentary in this list.
-Avoid mixing numbered lists and Specific Goals lists in the same section.
Keep all formatting simple, plain-text, and consistent.

Using this information, generate a career plan that includes the following and is based on the current date {current_date}:

1. A personalized roadmap outlining what steps they need to take to reach their target role. This should include specific certifications, classes, internships, and technical projects.
2. A list of technical and soft skills they should develop to match the expectations of their target companies.
3. A list of YouTube search terms that will help them learn the required skills or prepare for interviews. These should be tailored to their passions, learning preferences, and skills gaps.
4. A list of job titles they could apply for right now based on their current background.

Please ensure the output reflects the user’s actual education level and timeline as provided (e.g., if the user is a sophomore, do not mention "Junior Year" or incorrect years like "Summer 2025 Internship Application Season").
Use relative phrasing or directly pull from the user’s input to keep timelines accurate.

Your tone should be friendly, coaching, and specific — as if you’re guiding a motivated student who is eager to break into the tech industry. Start your response with your greeting to the user
Avoid generic advice and tailor every suggestion to the user's goals, skills, and target companies. If relevant, break your response into logical sections with headings for each deliverable.
"""

def get_roadmap(questionnaire_res, current_date = datetime.datetime.now().strftime("%B %d, %Y")):
    formatted_prompt = roadmap_prompt.format(
        profile=json.dumps(questionnaire_res, indent=2),
        current_date = current_date
    )

    res = client.models.generate_content(
        model="gemini-2.5-flash",
        config=types.GenerateContentConfig(
          system_instruction="You are a professional career roadmap assistant"
        ),
        contents=formatted_prompt
    )

    return res