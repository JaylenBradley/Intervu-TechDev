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
    return f"""You are a resume feedback assistant. I will give you my resume experience section text.

For each job/experience or project, do the following:

If it's a job/experience, print the position title and company like this:
Position: [Title] | Company [Company]

If it's a project, print it like this:
Project: [Project Name]

For each bullet under that position or project:

Print:Original: followed by the bullet point and a newline

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

Keep the formatting consistent and professional
Raw resume text:
{resume_text}
"""