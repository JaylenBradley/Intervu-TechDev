import os
from questionnaire import questionnaire
from get_roadmap import get_roadmap
from get_relevant_videos import get_videos
from resume import get_latest_resume_content, init_db, ai_give_specific_feedback, save_parsed_data_to_db, extract_text_from_pdf, ai_parse_resume_with_gemini, ai_improve_resume_with_gemini, save_text_as_pdf
def main_menu():
    print("\nWelcome to Navia Career Navigator")
    print("-----------------------------------")
    print("Choose an option:")
    print("1. Fill out Career Questionnaire")
    print("2. Add Resume to database")
    print("3. Generate a new improved Resume and Save as PDF")
    print("4. Give feedback and alternatives to resume")
    print("5. Get YouTube video recommendations")
    print("0. Exit")

def run_questionnaire():
    print("\n--- Career Questionnaire ---")
    answers = questionnaire()
    roadmap = get_roadmap(answers)
    print("\nRoadmap based on your answers:\n")
    print(roadmap.text)

def parse_resume():
    file_path = input("Enter full file path to your resume PDF: ").strip()
    if not os.path.exists(file_path):
        print("File not found.")
        return
    raw_text = extract_text_from_pdf(user_id, file_path)
    parsed_json = ai_parse_resume_with_gemini(raw_text)
    save_parsed_data_to_db(parsed_json, db_url="sqlite:///career_prep_data.db")
    print("Resume added succesfully\n")

def improve_resume():
    raw_text = get_latest_resume_content(user_id)
    if not raw_text:
        print("No resume found in database. Please add one first with option 2.")
        return
    
    improved = ai_improve_resume_with_gemini(raw_text)
    print("\nImproved Resume:\n")
    print(improved)
    save_path = input("Enter output path for PDF (e.g. improved_resume.pdf): ").strip()
    save_text_as_pdf(improved, save_path)
    print(f"Resume saved as PDF to {save_path}")

def resume_feedback():
    raw_text = get_latest_resume_content(user_id)
    if not raw_text:
        print("No resume found in database. Please add one first with option 2.")
        return
    feedback = ai_give_specific_feedback(raw_text)
    print(feedback)

def video_recommendations():
    print("\n--- YouTube Video Recommendations ---")
    query = input("Enter topic to search: ").strip()
    print("Duration options: any, short, medium, long")
    valid_durations = ('any', 'short', 'medium', 'long')
    while True:
        duration_input = input("Choose a duration filter (default 'any'): ").strip().lower()
        if duration_input == "":
            duration = "any"
            break
        if duration_input in valid_durations:
            duration = duration_input
            break
        print(f"Invalid duration '{duration_input}'. Please enter one of: {', '.join(valid_durations)}")
    
    get_videos(query, duration)


if __name__ == "__main__":
    init_db()
    user_id = 3


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
