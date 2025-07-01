import os
from questionnaire import questionnaire
from get_roadmap import get_roadmap
from resume import save_parsed_data_to_db, extract_text_from_pdf, ai_parse_resume_with_gemini, ai_improve_resume_with_gemini, save_text_as_pdf

def main_menu():
    print("\nWelcome to Navia Career Navigator")
    print("-----------------------------------")
    print("Choose an option:")
    print("1. Fill out Career Questionnaire")
    print("2. Parse Resume PDF")
    print("3. Improve Resume and Save as PDF")
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
    raw_text = extract_text_from_pdf(file_path)
    parsed_json = ai_parse_resume_with_gemini(raw_text)
    save_parsed_data_to_db(parsed_json, db_url="sqlite:///career_prep_data.db")
    print("\nParsed Resume (JSON format):\n")
    print(parsed_json)

def improve_resume():
    file_path = input("Enter full file path to your resume PDF: ").strip()
    if not os.path.exists(file_path):
        print("File not found.")
        return
    raw_text = extract_text_from_pdf(file_path)
    improved = ai_improve_resume_with_gemini(raw_text)
    print("\nImproved Resume:\n")
    print(improved)
    save_path = input("Enter output path for PDF (e.g. improved_resume.pdf): ").strip()
    save_text_as_pdf(improved, save_path)
    print(f"Resume saved as PDF to {save_path}")

if __name__ == "__main__":
    while True:
        main_menu()
        choice = input("Enter your choice: ").strip()
        if choice == "1":
            run_questionnaire()
        elif choice == "2":
            parse_resume()
        elif choice == "3":
            improve_resume()
        elif choice == "0":
            print("Goodbye!")
            break
        else:
            print("Invalid input. Please enter 1, 2, 3, or 0.")
