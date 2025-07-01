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
- Use only hyphens (-) or incrementing numbers (1., 2., etc.) for bullet points to keep formatting clean.
- When using numbered lists, restart numbering for each new section — do not repeat the same number across sections.
- Avoid using Markdown formatting entirely: do not use asterisks (*) or hash symbols (#) at all in your output, don't bother using "**" to make words bold either.
- Section titles must be a single line in ALL CAPS, followed by a colon.
    
For SPECIFIC GOALS:
- Format this section exactly as follows:
  SPECIFIC GOALS:
  - goal 1
  - goal 2
  - goal 3
- Do not include dates, timeframes, or commentary in the goal list.
- Do not mix numbered lists and SPECIFIC GOALS lists in the same section.

For YOUTUBE SEARCH TERMS:
- Begin the section with the heading exactly as:  
  YOUTUBE SEARCH TERMS:
- Then provide a clean, plain list of suggested search terms, each on its own line with a hyphen (-).  
- Do not include quotation marks, JSON arrays, or any formatting other than a vertical hyphenated list. 
    
Timeline Clarification:
- Today’s date is: {current_date}
- Based on the user's reported education level (e.g., "I am currently a junior"), assume:
  - If the current date is during summer break, their next semester is the same level (e.g., still a junior).
  - If the user says they are a junior, refer to them as a junior throughout. Do not write "rising senior" or change their grade level.
  - Keep timeline phrasing flexible and tied to the actual date and academic status, such as "during your junior year" or "in the upcoming semester."

- Do not use inline lists inside paragraphs; always place bullet or numbered lists on separate lines.
- Do not include any text outside of clearly labeled sections.
- For the list of YouTube search terms, provide them as a JSON array only, like:
    ["search term 1", "search term 2", "search term 3"]
    This array should appear under the section titled YOUTUBE SEARCH TERMS.
  
Keep all formatting simple, plain-text, and consistent.

Using this information, generate a career plan that includes the following and is based on the current date {current_date}:

1. A personalized roadmap outlining what steps they need to take to reach their target role. This should include specific certifications, classes, internships, and technical projects.
2. A list of technical and soft skills they should develop to match the expectations of their target companies.
3. A list of YouTube search terms that will help them learn the required skills or prepare for interviews. These should be tailored to their passions, learning preferences, and skills gaps.
4. A list of job titles they could apply for right now based on their current background.

Please ensure the output reflects the user’s actual education level and timeline as provided (e.g., if the user is a sophomore, do not mention "Junior Year" or incorrect years like "Summer 2025 Internship Application Season").
Use relative phrasing or directly pull from the user’s input to keep timelines accurate.

Your tone should be friendly, coaching, and specific — as if you’re guiding a motivated student who is eager to break into the tech industry. 
Avoid generic advice and tailor every suggestion to the user's goals, skills, and target companies. If relevant, break your response into logical sections with headings for each deliverable.
Start your response with a friendly greeting
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

# In the prompt, include books, and or coursera courses
# Need to provide specific links for resources (i.e coursera courses)