import os
from questionnaire import questionnaire
from get_roadmap import get_roadmap
from get_relevant_videos import get_videos
from resume import get_latest_resume_content, ai_give_specific_feedback, save_parsed_data_to_db, extract_text_from_pdf, ai_parse_resume_with_gemini, ai_improve_resume_with_gemini, save_text_as_pdf
from db import init_db

def main_menu():
    print("\n---- Main Menu ----")
    print("Choose an option:")
    print("1. Fill out Career Questionnaire")
    print("2. Add Resume to database")
    print("3. Generate a new improved Resume and Save as PDF")
    print("4. Give feedback and alternatives to resume")
    print("5. Get YouTube video recommendations")
    print("0. Exit")
    print("-" * 80)
    print()


def run_questionnaire():
    print("--- Career Questionnaire ---")
    answers = questionnaire(user_id)
    if not answers:
        main_menu()
    else:
        print()
        print("Generating your roadmap...")
        print()

        roadmap = get_roadmap(answers)
        print("\nYour Career Roadmap:\n")
        print(roadmap.text)
        print("-" * 80)
        print()

def parse_resume():
    print("--- Add Resume to Database ---")
    print('To go back to the main menu, please enter "0"\n')
    file_path = input("Enter full file path to your resume PDF: ").strip()
    if file_path == '0':
        return
    elif not os.path.exists(file_path):
        print("File not found.")
        return
    else:
        print("Loading...")
        raw_text = extract_text_from_pdf(user_id, file_path)
        parsed_json = ai_parse_resume_with_gemini(raw_text)
        save_parsed_data_to_db(parsed_json, db_url="sqlite:///career_prep_data.db")
        print("Resume added succesfully\n")
        print("-" * 80)
        print()

def improve_resume():
    print("--- Improve & Save Resume ---")
    raw_text = get_latest_resume_content(user_id)
    if not raw_text:
        print("No resume found in database. Please add one first with option 2.")
        return
    print("Loading...")

    improved = ai_improve_resume_with_gemini(raw_text)
    print("\nImproved Resume:\n")
    print(improved)
    save_path = input("Enter output path for PDF (e.g. improved_resume.pdf): ").strip()
    save_text_as_pdf(improved, save_path)
    print(f"Resume saved as PDF to {save_path}")
    print("-" * 80)
    print()


def resume_feedback():
    print("--- Resume Feedback & Alternatives ---")
    raw_text = get_latest_resume_content(user_id)
    if not raw_text:
        print("No resume found in database. Please add one first with option 2.")
        print('\n')
        return
    print("Loading...")
    feedback = ai_give_specific_feedback(raw_text)
    print("\nFeedback:\n")
    print(feedback)
    print("-" * 80)
    print()

def video_recommendations():
    print("--- YouTube Video Recommendations ---")
    print('To go back to the main menu, please enter "0"\n')

    query = input("Enter topic to search: ").strip()
    if query == '0':
        return
    print("Duration options: any, short, medium, long")
    valid_durations = ('any', 'short', 'medium', 'long')
    while True:
        duration_input = input("Choose a duration filter (default 'any'): ").strip().lower()
        if duration_input == "":
            duration = "any"
            break
        if duration_input == '0':
            return
        if duration_input in valid_durations:
            duration = duration_input
            break
        print(f"Invalid duration '{duration_input}'. Please enter one of: {', '.join(valid_durations)}")
    
    get_videos(query, duration)
    print("-" * 80)
    print()


if __name__ == "__main__":
    init_db()
    user_id = 2
    title = r"""
    _____  ___        __  ___      ___  __          __    
    (\"   \|"  \      /""\|"  \    /"  ||" \        /""\     
    |.\\   \    |    /    \\   \  //  / ||  |      /    \    
    |: \.   \\  |   /' /\  \\\  \/. ./  |:  |     /' /\  \   
    |.  \    \. |  //  __'  \\.    //   |.  |    //  __'  \  
    |    \    \ | /   /  \\  \\\   /    /\  |\  /   /  \\  \ 
    \___|\____\)(___/    \___)\__/    (__\_|_)(___/    \___)  
    """
    print(title)
    print("Navia Career Navigator is your AI-powered career advisor and coach.")
    print("Explore career paths, refine your resume, and access curated resources \nto accelerate your professional journey.")
    print("-" * 80)

    while True:
        main_menu()
        choice = input("Enter your choice: ").strip()
        if choice == "1":
            run_questionnaire()
        elif choice == "2":
            parse_resume()
        elif choice == "3":
            improve_resume()
        elif choice == '4':
            resume_feedback()
        elif choice == "5":
            video_recommendations()
        elif choice == "0":
            print("Goodbye!")
            break
        else:
            print("Invalid input. Please enter 1, 2, 3, 4, 5 or 0.")
