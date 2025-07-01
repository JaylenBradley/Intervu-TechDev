import os
import json
from google import genai
from google.genai import types
from PyPDF2 import PdfReader
import pandas as pd
import sqlalchemy as db
from dotenv import load_dotenv
load_dotenv()

mock2 = {'education': 'Bachelor of Science, Computer Science , Minor in Business | Expected May 2027\nUniversity of Kansas | Lawrence, KS\n• GPA: 4.0 | Member of the Honors Program , University Scholar, Undergraduate Research Fellow', 'experience': 'Open Source Developer | May 2024 – Sep 2024\nGoogle Summer of Code – Lappis | Remote\n• Selected among top 3% of 43,984 applicants for GSoC, receiving mentorship to develop a data integration \nframework between Empurrando Juntas (EJ) and Decidim .\n• Optimized clustering and platform speed by integrating Celery and RabbitMQ for asynchronous task management. \n• Cut execution time by 35% through parallelization and refactoring data handling with Joblib, NumPy, and Pandas. \n\nResearch Technician | Oct 2023 – Jun 2024\nWispr AI | Lawrence, KS\n• Enhanced neuromuscular data collection accuracy by 15% using surface EMG sensors during speech tasks. \n• Produced detailed lab reports by interpreting and storing biophysiological data from 100 + research sessions. \n• Managed session scheduling, communications, and payments for research participants. \n\nUndergraduate Research Assistant | Sep 2023 – Present\nCenter for Remote Sensing and Integrated Systems (CReSIS) | Lawrence, KS\n• Optimized data visualization and user interaction in the OPS Geoportal website, improving geospatial data access \nfor climate change researchers. \n• Collaborate d with a team to apply supervised learning models to identify glacier layers from echogram images. \n• Debugged JavaScript features, including Antarctic/Artic transitions, and echogram image browser issues.', 'skills': '• Programming Languages: Python, C, C++, SQL, JavaScript, Type Scrip t, HTML/CSS \n• Tools: Git, Linux, Docker, Azure , AWS , TensorFlow, Scikit -Learn , Figma \n• Certifications: Machine Learning Specialization (University of Washington), HTML, CSS, and JavaScript for Web \nDevelopers (Johns Hopkins University)', 'projects': 'KU Parking app | React Native, Typescript, Firebase, Goo gle Map s API \n• Developed a mobile app that recommends optimal parking locations based on user -reported availability, permit \ntype, and distance. \n\nReflect ly | JavaScript, Node.js, Express.js, MongoDB, Passport.js \n• Developed a responsive and user -friendly journaling app , applying UX design principles to enhance the note -taking \nexperience. Implemented secure authentication with Passport.js and built a scalable backend using Node.js, \nExpress.js, and MongoDB to efficiently manage user data.'}

# 1) Configure Gemini
genai.api_key = os.getenv('GENAI_KEY')
client = genai.Client(api_key=genai.api_key)

# 2) Utility to extract raw text from the PDF
def extract_text_from_pdf(file_path: str) -> str:
    reader = PdfReader(file_path)
    text = ""
    for page in reader.pages:
        text += (page.extract_text() or "") + "\n"
    return text

# 3) Use Gemini to turn raw text into structured JSON
def ai_parse_resume_with_gemini(resume_text: str) -> dict:
    prompt = f"""
You are a resume parser. Given the following resume text, output ONLY text that is in the form of valid JSON **do not include markdown back-ticks actual json format, just normal text that would be valid as json. also dont include newline symbols
- education: string
- experience: string
- skills: string
- projects: string
Resume text:
{resume_text}
"""
    response = client.models.generate_content(
        model="gemini-2.5-flash",
        config=types.GenerateContentConfig(temperature=0.0),
        contents=prompt
    )
    print(json.loads(response.text))
    return json.loads(response.text)

def save_parsed_data_to_db(data: dict, db_url="sqlite:///career_prep_data.db"):
    df = pd.DataFrame.from_dict([data])
    engine = db.create_engine(db_url)
    df.to_sql("resumes", con=engine, if_exists="replace", index=False)
    return df

if __name__ == "__main__":
    file_path = r"C:/Users/saman/Desktop/coso/samantha_adorno_resume_brinks.pdf"
    # raw_text = extract_text_from_pdf(file_path)
    # parsed = ai_parse_resume_with_gemini(raw_text)
    df = save_parsed_data_to_db(mock2)
    print(df)