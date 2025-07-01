from main import main_menu

def get_valid_input(prompt, valid_options=None, allow_none=False):
    while True:
        response = input(prompt).strip().lower()
        if response.isdigit() and int(response) == 0:
            main_menu()
        if allow_none and response == "none":
            return response
        if valid_options:
            if response in valid_options:
                return response
            print(f"Input must be one of: {', '.join(valid_options)}. Please try again.")
        else:
            if response:
                return response
            print("Input cannot be empty, please try again.")

def questionnaire():
    print("Welcome to Navia Career Questionnaire!\nPlease answer the following questions:\n")
    print('To exit the questionnaire, please enter "0"')

    career_goal = get_valid_input("1. What is your target job title or role? ")
    major = get_valid_input("2. What is/are your current major(s) or field of study? (Separate with commas) ")
    education_level = get_valid_input("3. What is your current education level? (e.g., High School, College Sophomore, Professional) ")
    passions = get_valid_input("4. What are your main passions or interests related to your career? (Separate with commas) ")
    institution = get_valid_input("5. What school, university, or institution do you or did you attend? ")
    target_companies = get_valid_input("6. List companies or industries you want to work for (Separate with commas): ")
    skills = get_valid_input("7. List your current technical skills or programming languages you know (Separate with commas, or type 'none'): ", allow_none=True)
    certifications = get_valid_input("8. Do you have any certifications? Please list them (Separate with commas, or type 'none'): ", allow_none=True)
    projects = get_valid_input("9. Describe any relevant personal or school projects you have worked on (or type 'none'): ", allow_none=True)
    internships = get_valid_input("10. Do you have any internship or job experience related to your career goals? Please describe (or type 'none'): ", allow_none=True)
    timeline = get_valid_input("11. What is your desired timeline to achieve your career goals? (e.g., 6 months, 1 year): ")
    learning_pref = get_valid_input("12. How do you prefer to learn? (videos, articles, projects, classes): ")
    available_hours = get_valid_input("13. How many hours per week can you dedicate to learning and career prep?: ")

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
        "internships": None if internships == "none" else internships,
        "timeline": timeline,
        "learning_preference": learning_pref,
        "available_hours_per_week": available_hours,
    }

    return answers

# Modify questionnaire
# Ask the user where they go to school (uni)
# Ask if either current student or grad
# - If grad just continue
# - If still student, then ask what year

# Print loading... after the user finishes the questionare to indicate that the roadmap is being created