import sqlite3

def get_valid_input(prompt, valid_options=None, allow_none=False):
    while True:
        response = input(prompt).strip().lower()
        if response.isdigit() and int(response) == 0:
            return None
        elif allow_none and response == "none":
            return response
        elif valid_options:
            if response in valid_options:
                return response
            print(f"Input must be one of: {', '.join(valid_options)}. Please try again.")
        else:
            if response:
                return response
            print("Input cannot be empty, please try again.")

def save_questionnaire(user_id, answers_dict):
    cols = ['user_id'] + list(answers_dict.keys())
    placeholders = ','.join('?' for _ in cols)
    sql = f"""
      INSERT OR REPLACE INTO questionnaire ({','.join(cols)}) VALUES ({placeholders})
    """
    values = [user_id] + [answers_dict[k] for k in answers_dict]

    conn = sqlite3.connect('career_prep_data.db')
    c = conn.cursor()
    c.execute(sql, values)
    conn.commit()
    conn.close()


def questionnaire(user_id):
    print("Welcome to Navia Career Questionnaire!\nPlease answer the following questions:")
    print('To go back to the main menu, please enter "0"\n')

    career_goal = get_valid_input("1. What is your target job title or role? ")
    if not career_goal:
        return None

    major = get_valid_input("2. What is/are your current major(s) or field of study? (Separate with commas) ")
    if not major:
        return None

    education_level = get_valid_input("3. What is your current education level? (e.g., High School, College Sophomore, Professional) ")
    if not education_level:
        return None

    passions = get_valid_input("4. What are your main passions or interests related to your career? (Separate with commas) ")
    if not passions:
        return None

    institution = get_valid_input("5. What school, university, or institution do you or did you attend? ")
    if not institution:
        return None

    target_companies = get_valid_input("6. List companies or industries you want to work for (Separate with commas): ")
    if not target_companies:
        return None

    skills = get_valid_input("7. List your current technical skills or programming languages you know (Separate with commas, or type 'none'): ", allow_none=True)
    if not skills:
        return None

    certifications = get_valid_input("8. Do you have any certifications? Please list them (Separate with commas, or type 'none'): ", allow_none=True)
    if not certifications:
        return None

    projects = get_valid_input("9. Describe any relevant personal or school projects you have worked on (or type 'none'): ", allow_none=True)
    if not projects:
        return None

    experience = get_valid_input("10. Do you have any internship or job experience related to your career goals? Please describe (or type 'none'): ", allow_none=True)
    if not experience:
        return None

    timeline = get_valid_input("11. What is your desired timeline to achieve your career goals? (e.g., 6 months, 1 year): ")
    if not timeline:
        return None

    learning_pref = get_valid_input("12. How do you prefer to learn? (videos, articles, projects, classes): ")
    if not learning_pref:
        return None

    available_hours = get_valid_input("13. How many hours per week can you dedicate to learning and career prep?: ")
    if not available_hours:
        return None

    answers = {
        "career_goal": career_goal,
        "major": major,
        "education_level": education_level,
        "passions": [p.strip() for p in passions.split(",")],
        "institution": institution,
        "target_companies": [c.strip() for c in target_companies.split(",")],
        "skills": [] if skills == "none" else [s.strip() for s in skills.split(",")],
        "certifications": [] if certifications == "none" else [c.strip() for c in certifications.split(",")],
        "projects": None if projects == "none" else projects,
        "experience": None if experience == "none" else experience,
        "timeline": timeline,
        "learning_preference": learning_pref,
        "available_hours_per_week": available_hours,
    }

    #adds to database
    cleaned = {}
    for key, value in answers.items():
        if isinstance(value, list):
            cleaned[key] = (',').join(value)
        elif value is None:
            cleaned[key] = ''
        else:
            cleaned[key] = value

    save_questionnaire(user_id, cleaned)
    return answers


# mock = {'career_goal': 'international super model', 'major': 'fashion', 'education_level': 'professional', 'passions': ['clothes'], 'institution': 'harvard', 'target_companies': ['dior'], 'skills': [], 'certifications': [], 'projects': None, 'internships': None, 'timeline': '1 day', 'learning_preference': 'classes', 'available_hours_per_week': '10 days'}
# import sqlite3
# conn = sqlite3.connect('career_prep_data.db')
# c = conn.cursor()
# c.execute("SELECT * FROM  questionnaire;")
# print(c.fetchall())
# conn.close()


# Modify questionnaire
# Ask the user where they go to school (uni)
# Ask if either current student or grad
# - If grad just continue
# - If still student, then ask what year