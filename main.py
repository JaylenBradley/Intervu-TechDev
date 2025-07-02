import os
from questionnaire import questionnaire
from get_roadmap import get_roadmap
from get_relevant_videos import get_videos, extract_youtube_search_terms
from resume import get_latest_resume_content, ai_give_specific_feedback, save_parsed_data_to_db, extract_text_from_pdf, ai_parse_resume_with_gemini, ai_improve_resume_with_gemini, save_text_as_pdf
from db import init_db

def main_menu():
    print("---- Main Menu ----")
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
        roadmap_text = roadmap.text
        print("\nYour Career Roadmap:\n")
        print(roadmap_text)
        print("-" * 80)
        return roadmap_text

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
        save_parsed_data_to_db(parsed_json)
        print("Resume added succesfully\n")
        print("-" * 80)

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

def video_recommendations(query):
    print("--- YouTube Video Recommendations ---")

    if not query:
        print("No YouTube search terms found in your roadmap.")
        return

    print("Available search queries based on your roadmap:")
    for i, q in enumerate(query, 1):
        print(f"{i}. {q}")
    print()

    while True:
        user_choice = input(f"Enter the number of the topic to search (1-{len(queries)}), or '0' to return to the main menu: ").strip()
        if user_choice == '0':
            return
        if user_choice.isdigit() and 1 <= int(user_choice) <= len(queries):
            selected_query = queries[int(user_choice) - 1]
            break
        print("Invalid input. Please enter a valid number or 0 to return to the main menu.")

    valid_durations = ('any', 'short', 'medium', 'long')
    print("Duration options: 'any', 'short' (< 4 min), 'medium' (4–20 min), or 'long' (> 20 min)")
    while True:
        duration_input = input("Choose a duration filter (default 'any') or enter '0' to return to the main menu: ").strip().lower()
        if duration_input == '0':
            return
        elif duration_input == "":
            duration = "any"
            break
        elif duration_input in valid_durations:
            duration = duration_input
            break
        else:
            print(f"Invalid duration '{duration_input}'. Please enter one of: {', '.join(valid_durations)} or '0' to return to the main menu")

    valid_languages = {
        'english': 'en',
        'spanish': 'es',
        'french': 'fr',
        'german': 'de',
        'hindi': 'hi',
        'chinese': 'zh',
        'japanese': 'ja',
        'korean': 'ko',
        'portuguese': 'pt',
        'russian': 'ru',
        'arabic': 'ar',
        'italian': 'it',
        'dutch': 'nl',
        'turkish': 'tr',
        'vietnamese': 'vi'
    }

    print("Language options: " + ", ".join(valid_languages.keys()))
    while True:
        language_input = input("Choose a language for the videos (default 'english') or enter '0' to return to the main menu: ").strip().lower()
        if language_input == "0":
            return
        elif language_input == "":
            language = None
            break
        elif language_input in valid_languages:
            language = valid_languages[language_input]
            break
        else:
            print("Invalid language. Please choose from: " + ", ".join(
                valid_languages.keys()) + " or enter '0' to return to the main menu")

    while True:
        num_videos_input = input("How many recommendations would you like? \nPlease enter a number from 1 - 10 (default 1) or 0 to return to the main menu: ").strip().lower()
        if num_videos_input == "0":
            return
        elif num_videos_input == "":
            num_videos = None
            break
        elif num_videos_input.isdigit():
            num = int(num_videos_input)
            if num in range(1, 11):
                num_videos = num
                break
            else:
                print("Invalid number. Please enter a number from 1 - 10 or 0 to return to the main menu.")
        else:
            print("Invalid input. Please choose enter a number from 1 - 10 or 0 to return to the main menu.")

    get_videos(selected_query, duration, language=language, num_videos=num_videos)
    print("-" * 80)

if __name__ == "__main__":
    init_db()
    user_id = 2
    roadmap_text = None

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
            roadmap_text = run_questionnaire()
        elif choice == "2":
            parse_resume()
        elif choice == "3":
            improve_resume()
        elif choice == '4':
            resume_feedback()
        elif choice == "5":
            if not roadmap_text:
                print("Please complete the questionnaire before getting recommendations\n")
            else:
                queries = extract_youtube_search_terms(roadmap_text)
                video_recommendations(queries)
        elif choice == "0":
            print("Goodbye!")
            break
        else:
            print("Invalid input. Please enter 1, 2, 3, 4, 5 or 0.")
