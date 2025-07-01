import os
import json
from google import genai
from google.genai import types
from PyPDF2 import PdfReader
import pandas as pd
import sqlalchemy as db
import sqlite3
from dotenv import load_dotenv
from fpdf import FPDF
load_dotenv()
import re

mock2 = {'education': 'Bachelor of Science, Computer Science , Minor in Business | Expected May 2027\nUniversity of Kansas | Lawrence, KS\n• GPA: 4.0 | Member of the Honors Program , University Scholar, Undergraduate Research Fellow', 'experience': 'Open Source Developer | May 2024 – Sep 2024\nGoogle Summer of Code – Lappis | Remote\n• Selected among top 3% of 43,984 applicants for GSoC, receiving mentorship to develop a data integration \nframework between Empurrando Juntas (EJ) and Decidim .\n• Optimized clustering and platform speed by integrating Celery and RabbitMQ for asynchronous task management. \n• Cut execution time by 35% through parallelization and refactoring data handling with Joblib, NumPy. \n\nResearch Technician | Oct 2023 – Jun 2024\nWispr AI | Lawrence, KS\n• Enhanced neuromuscular data collection accuracy by 15% using surface EMG sensors during speech tasks. \n• Produced detailed lab reports by interpreting and storing biophysiological data from 100 + research sessions. \n• Managed session scheduling, communications, and payments for research participants. \n\nUndergraduate Research Assistant | Sep 2023 – Present\nCenter for Remote Sensing and Integrated Systems (CReSIS) | Lawrence, KS\n• Optimized data visualization and user interaction in the OPS Geoportal website, improving geospatial data access \nfor climate change researchers. \n• Collaborate d with a team to apply supervised learning models to identify glacier layers from echogram images. \n• Debugged JavaScript features, including Antarctic/Artic transitions, and echogram image browser issues.', 'skills': '• Programming Languages: Python, C, C++, SQL, JavaScript, Type Scrip t, HTML/CSS \n• Tools: Git, Linux, Docker, Azure , AWS , TensorFlow, Scikit -Learn , Figma \n• Certifications: Machine Learning Specialization (University of Washington), HTML, CSS, and JavaScript for Web \nDevelopers (Johns Hopkins University)', 'projects': 'KU Parking app | React Native, Typescript, Firebase, Goo gle Map s API \n• Developed a mobile app that recommends optimal parking locations based on user -reported availability, permit \ntype, and distance. \n\nReflect ly | JavaScript, Node.js, Express.js, MongoDB, Passport.js \n• Developed a responsive and user -friendly journaling app , applying UX design principles to enhance the note -taking \nexperience. Implemented secure authentication with Passport.js and built a scalable backend using Node.js, \nExpress.js, and MongoDB to efficiently manage user data.'}
mock_resume = """Helena Galeano
Lawrence, KS | helena.galeano@gmail.com | 785-917-8588 | linkedin.com/in/helena-galeano

EDUCATION
**University of Kansas** – Lawrence, KS
Bachelor of Science in Computer Science, Minor in Business | Expected May 2027
* GPA: 4.0/4.0 | Honors Program Member, University Scholar, Undergraduate Research Fellow

TECHNICAL SKILLS
* **Programming Languages:** Python, C, C++, JavaScript, TypeScript, HTML/CSS
* **Tools:** Git, Linux, Docker, Azure, Figma
* **Certifications:** Machine Learning Specialization (University of Washington), HTML, CSS, and JavaScript for Web Developers (Johns Hopkins University)

EXPERIENCE
**Intern** | RiskIQ | Remote
May 2024 – September 2024
* Developed 3+ product integrations for key clients using RiskIQ APIs, AWS Lambda, and Python, enhancing data flow.
* Engineered 5+ microservices to optimize data ingestion and access for various applications, improving retrieval efficiency by 20%.
* Built 2+ RESTful APIs using Spring MVC to facilitate secure data exchange between internal systems.

**Research Technician** | Wispr AI | Lawrence, KS
October 2023 – June 2024
* Enhanced neuromuscular data collection accuracy by 15% using surface EMG sensors during speech tasks.
* Analyzed and documented biophysiological data from over 100 research sessions, producing detailed lab reports.
* Coordinated logistics for 50+ research participants, including scheduling, communications, and payment processing.

**Undergraduate Research Assistant** | Center for Remote Sensing and Integrated Systems (CReSIS) | Lawrence, KS 
September 2023 – Present
* Optimized data visualization and user interaction for the OPS Geoportal website, improving geospatial data access for 100+ climate change researchers.
* Collaborated with a 3-person team to apply supervised learning models, achieving 90% accuracy in identifying glacier layers from 1000+ echogram images.
* Resolved 10+ critical JavaScript bugs, including Antarctic/Arctic transitions and echogram image browser issues, enhancing user experience and system stability.

PROJECTS
**KU Parking App** | React Native, TypeScript, Firebase, Google Maps API
* Developed a mobile application recommending optimal parking locations based on user-reported availability, permit type, and distance, potentially saving users 15+ minutes per search.

**Reflectly** | JavaScript, Node.js, Express.js, MongoDB, Passport.js
* Engineered a responsive journaling application, integrating 5+ UX design principles to enhance user experience.
* Implemented secure authentication via Passport.js and built a scalable backend capable of managing data for 1000+ users.

LEADERSHIP
**Logistics Chair, Expo Chair** | Women in Computing | Lawrence, KS
September 2023 – Present
* Managed a $20,000 budget and organized travel, lodging, and meetings for 15 students attending the Grace Hopper Conference.
* Led a 5-person team to organize a project for the KU Engineering Fair, engaging 3,000+ students and promoting technology.

**Resident Assistant** | University of Kansas | Lawrence, KS
August 2024 – Present
* Supported and guided 50+ residents by enforcing policies, resolving conflicts, and organizing 10+ community events to foster a safe and welcoming living environment."""
mock2 = {'education': 'Bachelor of Science, Computer Science , Minor in Business | Expected May 2027\nUniversity of Kansas | Lawrence, KS\n• GPA: 4.0 | Member of the Honors Program , University Scholar, Undergraduate Research Fellow', 'experience': 'Open Source Developer | May 2024 – Sep 2024\nGoogle Summer of Code – Lappis | Remote\n• Selected among top 3% of 43,984 applicants for GSoC, receiving mentorship to develop a data integration \nframework between Empurrando Juntas (EJ) and Decidim .\n• Optimized clustering and platform speed by integrating Celery and RabbitMQ for asynchronous task management. \n• Cut execution time by 35% through parallelization and refactoring data handling with Joblib, NumPy, and Pandas. \n\nResearch Technician | Oct 2023 – Jun 2024\nWispr AI | Lawrence, KS\n• Enhanced neuromuscular data collection accuracy by 15% using surface EMG sensors during speech tasks. \n• Produced detailed lab reports by interpreting and storing biophysiological data from 100 + research sessions. \n• Managed session scheduling, communications, and payments for research participants. \n\nUndergraduate Research Assistant | Sep 2023 – Present\nCenter for Remote Sensing and Integrated Systems (CReSIS) | Lawrence, KS\n• Optimized data visualization and user interaction in the OPS Geoportal website, improving geospatial data access \nfor climate change researchers. \n• Collaborate d with a team to apply supervised learning models to identify glacier layers from echogram images. \n• Debugged JavaScript features, including Antarctic/Artic transitions, and echogram image browser issues.', 'skills': '• Programming Languages: Python, C, C++, SQL, JavaScript, Type Scrip t, HTML/CSS \n• Tools: Git, Linux, Docker, Azure , AWS , TensorFlow, Scikit -Learn , Figma \n• Certifications: Machine Learning Specialization (University of Washington), HTML, CSS, and JavaScript for Web \nDevelopers (Johns Hopkins University)', 'projects': 'KU Parking app | React Native, Typescript, Firebase, Goo gle Map s API \n• Developed a mobile app that recommends optimal parking locations based on user -reported availability, permit \ntype, and distance. \n\nReflect ly | JavaScript, Node.js, Express.js, MongoDB, Passport.js \n• Developed a responsive and user -friendly journaling app , applying UX design principles to enhance the note -taking \nexperience. Implemented secure authentication with Passport.js and built a scalable backend using Node.js, \nExpress.js, and MongoDB to efficiently manage user data.'}

# Configure Gemini
genai.api_key = os.getenv('GENAI_API_KEY')
client = genai.Client(api_key=genai.api_key)

# Database
DB_PATH = 'career_prep_data.db'
def init_db():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("""
      CREATE TABLE IF NOT EXISTS raw_resume (
        id INTEGER PRIMARY KEY,
        file_path TEXT NOT NULL,
        content TEXT NOT NULL
      )
    """)
    conn.commit()
    conn.close()

# Utility to extract raw text from the PDF
def extract_text_from_pdf(user_id, file_path, db_url=DB_PATH):
    reader = PdfReader(file_path)
    text = ""
    for page in reader.pages:
        text += (page.extract_text() or "") + "\n"

    conn = sqlite3.connect(db_url)
    c = conn.cursor()
    c.execute(
        "INSERT OR REPLACE INTO raw_resume (id, file_path, content) VALUES (?, ?, ?)",
        (user_id, file_path, text)
    )
    conn.commit()
    conn.close()
    return text

def get_latest_resume_content(user_id):
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("SELECT content FROM raw_resume WHERE id = ?", (user_id,))
    row = c.fetchone()
    conn.close()
    return row[0] if row else ""

# Use Gemini to turn raw text into structured JSON
def ai_parse_resume_with_gemini(resume_text):
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
    return json.loads(response.text)

# Saves the data to SQL
def save_parsed_data_to_db(data, db_url=DB_PATH):
    df = pd.DataFrame.from_dict([data])
    engine = db.create_engine(db_url)
    df.to_sql("resumes", con=engine, if_exists="replace", index=False)
    return df

# Prompt to optimize resume
def ai_improve_resume_with_gemini(resume_text):
    prompt = f"""
You are a senior professional resume coach. Here is a candidate’s raw resume text. Rewrite the entire resume to:

- Use concise bullet points under clear section headings, and maintain important information such as date, location.
- Lead with strong action verbs.  
- Quantify every achievement (e.g., “Improved X by 35%,” “Managed a team of 5,” “Reduced runtime from 10s to 3s”).  
- Keep it to 1 page max and maintain a clean, ATS-friendly format.  

Return only the fully rewritten resume in plain text (no markdown fences, no JSON, no commentary).  

Raw resume text: 
{resume_text}
"""
    response = client.models.generate_content(
        model="gemini-2.5-flash",
        config=types.GenerateContentConfig(temperature=0.3),
        contents=prompt
    )
    return response.text

# Extracts text from a pdf and returns an improved resume text
def improve_pdf_resume(file_path):
    raw = extract_text_from_pdf(file_path)
    improved = ai_improve_resume_with_gemini(raw)
    return improved

# Convert the text from the improved resume to a pdf
def save_text_as_pdf(text, output_path):
    BOLD_RE = re.compile(r'(\*\*.+?\*\*)')
    sanitize_map = {
        '–': '-',  '—': '-',
        '“': '"',  '”': '"',
        '‘': "'",  '’': "'",
        '•': '-',  '…': '...',
    }
    for uni, ascii_char in sanitize_map.items():
        text = text.replace(uni, ascii_char)

    pdf = FPDF()
    pdf.set_auto_page_break(auto=True, margin=15)
    pdf.add_page()
    pdf.set_font("Arial", size=10)

    for raw_line in text.split('\n'):
        line = raw_line.strip()
        if not line:
            pdf.ln(4)
            continue

        # HEADINGS
        if line.isupper():
            pdf.set_font("Arial", style='B', size=11)
            pdf.cell(0, 8, line)
            pdf.ln(10)
            pdf.set_font("Arial", size=10)
            continue

        # BULLETS
        if line.startswith('* '):
            bullet_text = line[2:].strip()  
            pdf.cell(6)                  
            pdf.cell(4, 8, '-')            
            parts = BOLD_RE.split(bullet_text)
            for part in parts:
                if part.startswith('**') and part.endswith('**'):
                    pdf.set_font("Arial", style='B', size=10)
                    pdf.write(8, part[2:-2])
                else:
                    pdf.set_font("Arial", size=10)
                    pdf.write(8, part)
            pdf.ln(8)
            continue

        # INLINE BOLD
        parts = re.split(r'(\*\*.+?\*\*)', line)
        if len(parts) > 1:
            for part in parts:
                if part.startswith('**') and part.endswith('**'):
                    pdf.set_font("Arial", style='B', size=10)
                    pdf.write(8, part[2:-2])
                else:
                    pdf.set_font("Arial", size=10)
                    pdf.write(8, part)
            pdf.ln(8)
            pdf.set_font("Arial", size=10)  
            continue

        # plain text
        pdf.multi_cell(0, 8, line)

    pdf.output(output_path)

def ai_give_specific_feedback(old_resume_text):
    prompt = f"""
    You are a resume feedback assistant. I will give you my resume experience section text.

    For each job/experience or project, do the following:

    If it's a job/experience, print the position title and company like this:
    Position: [Title] | Company [Company]

    If it's a project, print it like this:
    Project: [Project Name]

    For each bullet under that position or project:

    Print:+Original: followed by the bullet point and a newline

    Print:Feedback: followed by a brief evaluation. If it’s strong, say so and explain why. If it needs improvement, give clear, concise suggestions. then print a new line

    Then print the following (formatted exactly like below):

    - Option 1: [Improved version of the bullet point]  
    - Option 2: [Another improved version of the bullet point]
    Separate each job or project section with a line like this:
    print a new line
    Important guidelines:

    Do NOT use markdown formatting (no **, *, etc.)

    Format everything cleanly for display in a command-line interface

    Do not print section titles like "Experience" or "Projects"

    Keep the formatting consistent and professiona
    Raw resume text: 
    {old_resume_text}
    """
    response = client.models.generate_content(
        model="gemini-2.5-flash",
        config=types.GenerateContentConfig(temperature=0.3),
        contents=prompt
    )
    return response.text

# if __name__ == "__main__":
#     file_path = r"C:\Users\saman\Desktop\coso\mock_resume.pdf"
    # raw_text = extract_text_from_pdf(file_path)
    # improved = improve_pdf_resume(file_path)
    # print(improved)
    # parsed = ai_parse_resume_with_gemini(raw_text)
    # df = save_parsed_data_to_db(mock2)
    # print(df)
    #init_db()
    #extract_text_from_pdf(file_path)
    # resume = get_latest_resume_content()
    # print(resume)
    #feedback = ai_give_specific_feedback(resume)
    #print(feedback)

    #  output_pdf = r"C:/Users/saman/Desktop/coso/improved_resume.pdf"
    #  save_text_as_pdf(mock_resume, output_pdf)
    #  print(f"Improved resume written to {output_pdf}")
