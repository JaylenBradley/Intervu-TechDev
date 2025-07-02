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

# Configure Gemini
genai.api_key = os.getenv('GENAI_API_KEY')
client = genai.Client(api_key=genai.api_key)

# Database
DB_PATH = os.getenv('DB_PATH')

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

# queries your resume from the database
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
    sql_alchemy_url = "sqlite:///" + db_url
    df = pd.DataFrame.from_dict([data])
    engine = db.create_engine(sql_alchemy_url)
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
