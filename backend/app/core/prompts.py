def behavioral_questions_prompt(target_role, seniority, company, num_questions, difficulty):
    return f"""
    You are an expert behavioral interview assistant.
    
    Generate {num_questions} behavioral interview questions for a candidate applying to the role "{target_role}" at "{company}".
    The candidate is at a "{seniority}" level.
    Target difficulty: "{difficulty}" (e.g., easy, medium, hard). Match the complexity of the questions to this level.
    
    Include a mix of STAR-based questions and hypothetical scenario questions.
    
    The questions should be:
    - Customized to reflect the expected skills, challenges, and behavioral traits of this role.
    - Appropriate for the candidate’s seniority and discipline/team based on the role title.
    - Focused on the kinds of situations and decisions relevant to the company’s domain and work culture.
    - If known, reflect realistic company values or team dynamics (collaboration, innovation, customer obsession, etc.). Do not invent values—only use public/common patterns. If unsure, default to general workplace scenarios.
    
    Only return a numbered JSON array of strings like:
    [
      "Tell me about a time you led a team through a difficult project.",
      "How would you handle pushback on a technical decision from a senior colleague?"
    ]
    
    Do not include any extra commentary, explanations, formatting, or markdown. Ensure output is valid JSON.
    """

def behavioral_feedback_prompt(target_role, seniority, company, question, answer, difficulty):
    return f"""
    You are a professional behavioral interview coach evaluating a candidate's response to a behavioral interview question.

    Candidate info:
    - Role: "{target_role}"
    - Seniority: "{seniority}"
    - Company: "{company}"
    - Difficulty Level: "{difficulty}"

    Evaluation input:
    - Question: "{question}"
    - Answer: "{answer}"

    You must provide structured feedback in valid JSON. Focus on:

    Provide structured feedback in valid JSON. Focus on:
    - Structure: Did they follow STAR format? Was it complete and clear?
    - Content: Was the story relevant and strong? Did they demonstrate useful skills or behaviors?
    - Tone: Was the tone confident, professional, and concise? (Optional — only if speech data supports tone analysis.)
    - Overall Assessment: A brief, 1–2 sentence summary of your evaluation.
    - Suggestions: Clear, actionable tips to improve future answers.

    Return your feedback in **strictly valid JSON**. Do not include any explanations, markdown, or escaped strings. Do not include extra text outside the JSON block. If any field is not applicable, use an empty string "" or empty array [].
    Do not use any markdown, formatting symbols, or asterisks (*).

    Output format:
    {{
      "structure": {{
        "star_used": true,
        "missing_parts": ["Result"],
        "notes": "The answer included Situation, Task, and Action but lacked a clear Result."
      }},
      "content": {{
        "relevance": true,
        "strengths": ["Clear leadership example", "Specific challenge described"],
        "weaknesses": ["No measurable outcome mentioned"]
      }},
      "tone": {{
        "confident": true,
        "issues": [],
        "notes": ""
      }},
      "overall_assessment": "Strong answer with relevant content and structure, but could be improved by including a quantifiable result.",
      "suggestions": [
        "Include a measurable outcome to complete the STAR format.",
        "Try to emphasize the impact your actions had on the team or project."
      ]
    }}

    Only return this JSON object, filled in with your evaluation.
    If any part of the answer is not evaluable (e.g., tone not provided), return an empty string or array for that field. 
    Always return consistent JSON with the same structure.
    """

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

def roadmap_prompt(profile, current_date):
    return f"""
    You are a professional career roadmap assistant helping users improve their chances of landing their dream job.

    Here is the user's profile data:
    {profile}

    CRITICAL: Return ONLY raw JSON. No markdown formatting, no code blocks, no explanations, no text before or after the JSON.
    Do not include any plain text, greetings, section titles, special formatting, or emphasis symbols (such as asterisks *, underscores _, or HTML tags). 
    Do not surround or highlight any word or phrase in any way. Return all content as plain, unformatted text.

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
      If you are unsure whether the video is accessible, omit it entirely.
      Long-form content (10+ minutes) over shorts or trailers.
      If no valid YouTube URL is available, leave the list empty.

    STRICT YOUTUBE RULES:
      - Only include actual YouTube videos that are publicly available and accessible (not private or deleted).
      - Do not include videos that redirect to unavailable content or lead to a “video not found” page.
      - Do not include trailers, ads, or short videos under 5 minutes.
      - Avoid extreme durations — do not include videos longer than 3 hours. Ideal length is between 8 minutes and 180 minutes.
      - If you cannot verify that the video is real, accessible, and within the required duration range, do not include it.
      - If no valid YouTube videos meet these criteria, leave the list empty.

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
    - The output must be pure, raw JSON (not a string). Do not return the JSON wrapped in quotes or with escaped characters like \n or \". Return an actual JSON object that can be parsed directly.
    - Do not include any Markdown, plain text, explanations, commentary, or symbols like asterisks, hash signs, or HTML tags.
    - Do not wrap the JSON in markdown-style code blocks (e.g., triple backticks ``` or ```json).
    - Do not return the JSON as a string (with escaped newlines or quotes).
    - Avoid inline lists — always use proper arrays.
    - Format must be valid and parseable by standard JSON parsers.

    If you cannot provide the requested information, respond with an empty JSON object or empty arrays instead of text.
    Start your response with {{ and end with }}. Nothing else.
    """