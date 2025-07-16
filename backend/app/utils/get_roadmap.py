import os
from dotenv import load_dotenv
import json
import datetime
from google import genai
from google.genai import types

load_dotenv()
api_key = os.getenv('GEMINI_API_KEY')
genai.api_key = api_key

client = genai.Client(
    api_key=api_key,
)

roadmap_prompt = """
You are a professional career roadmap assistant helping users improve their chances of landing their dream job.

Here is the user's profile data:
{profile}

Format the response as raw JSON. Do not include any plain text, greetings, section titles, or formatting symbols.

The JSON should include the following top-level keys:

- "specific_goals": A list of specific goals based on the user's target role. Do not include dates, commentary, or number the items. Use plain bullet-style strings in the list.
    - If the user mentions any target companies (e.g., Google, JPMorgan), at least one goal must reflect the intent to pursue opportunities there.

- "roadmap": A step-by-step ordered list of actions the user should take to reach their target role. Include courses, certifications, internships, and projects. Use incrementing numbers in the list as string values, e.g., "1. Complete XYZ certification".

- "skills": An object with two subcategories:
  - "technical": A list of technical skills to acquire.
  - "soft": A list of soft skills to improve.

- "youtube_search_terms": A list of descriptive YouTube video or playlist titles and full direct URLs. Each item should be an object with:
  - "title": The video/course title
  - "url": The full YouTube URL
  Do not include labels like "[YouTube]".

- "job_titles": A list of job titles the user could reasonably apply for right now based on their background.

- "resource_links": An object with the following subcategories. All subcategories must be present in the output, even if empty:
  - "courses": A list of objects, each with "title" and "url"
  - "books": A list of objects, each with "title" and "url"
  - "articles": A list of objects, each with "title" and "url"
  - "certifications": A list of objects, each with "title" and "url"
  - "other": A list of objects, each with "title" and "url"
  Only include reputable sources (e.g., Coursera, edX, Amazon). Do not include formatting labels like [Book] or [Course].

Timeline Guidance:
- Today’s date is: {current_date}
- Reflect the user’s reported education level accurately. For example:
  - If they say they’re a junior, refer to them as a junior — do not say “rising senior”.
  - Assume summer break means their academic level stays the same.
  - Use phrasing like “during your junior year” or “in the upcoming semester” to stay time-accurate.

Output formatting:
- The output must be pure JSON, with properly closed brackets.
- Do not include any Markdown, plain text, explanations, commentary, or symbols like asterisks, hash signs, or HTML tags.
- Do not wrap the JSON in markdown-style code blocks (e.g., triple backticks ``` or ```json).
- Do not return the JSON as a string (with escaped newlines or quotes).
- Avoid inline lists — always use proper arrays.
- Format must be valid and parseable by standard JSON parsers.

If you cannot provide the requested information, respond with an empty JSON object or empty arrays instead of text.
"""

# Generate roadmap based on questionnaire responses
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

    roadmap_text = res.text if hasattr(res, "text") else str(res)

    return {"roadmap": roadmap_text}