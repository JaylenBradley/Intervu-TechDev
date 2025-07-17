def improve_resume_prompt(resume_text: str) -> str:
    return f"""You are a senior professional resume coach. Here is a candidate’s raw resume text. Rewrite the entire resume to:

- Use concise bullet points under clear section headings, and maintain important information such as date, location.
- Lead with strong action verbs.
- Quantify every achievement (e.g., “Improved X by 35%,” “Managed a team of 5,” “Reduced runtime from 10s to 3s”). Don't make up numbers though, if you don't know numbers put X.
- Keep it to 1 page max and maintain a clean, ATS-friendly format.

Return only the fully rewritten resume in plain text (no markdown fences, no JSON, no commentary).

Raw resume text:
{resume_text}
"""

def feedback_resume_prompt(resume_text: str) -> str:
    return f"""You are a resume feedback assistant. Analyze this resume and provide feedback ONLY for substantive content.

IMPORTANT RULES:
- SKIP these lines (do not output anything for them):
  * Section headers: "Education, Experience", "Skills", "Projects", "Awards", "Employment History, Career Summary"
  * Job titles/positions: "Manager", "Assistant, Specialist", "Coordinator", "Director"
  * Company names and institutions
  * Project names and titles
  * Dates and locations
  * Contact information
  * Simple statements like "This is a clear entry" orThis is standard formatting"

- ONLY analyze these types of lines:
  * Bullet points with actual achievements (starting with • or -)
  * Degree descriptions with specific details
  * Certification descriptions with specific skills
  * Skills lists with multiple items
  * Achievement descriptions with quantifiable results

- For EVERY substantive line you analyze, you MUST provide:
  Original: [the line]
  Feedback:brief evaluation]
  - Option 1 [improved version]
  - Option 2: [another improved version]

- If a line is a header, title, company, project name, date, location, or simple statement, SKIP IT COMPLETELY.

Examples of what to SKIP:
- "Education" (section header)
- Marketing Manager" (job title)
- "Company Name" (company)
- "Project Name (project title)
-2023224ate range)
- "This is a clear entry" (simple statement)

Examples of what to ANALYZE:
-•Increased sales by 25% through targeted marketing campaigns..." (achievement bullet)
- "Bachelor of Science in Business Administration with 30.8(detailed degree)
- "Project management, data analysis, customer service" (skills list)

Resume text:
{resume_text}"""