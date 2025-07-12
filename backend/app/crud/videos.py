from sqlalchemy.orm import Session
from app.models.questionnaire import Questionnaire
from app.utils.get_relevant_videos import get_videos, extract_youtube_search_terms
from app.utils.get_roadmap import get_roadmap

def get_questionnaire_for_videos(db: Session, user_id: str):
    """
    Get questionnaire data for video recommendations
    """
    questionnaire = db.query(Questionnaire).filter(Questionnaire.user_id == user_id).first()
    
    if not questionnaire:
        return None
    
    # Convert to dict format with safe parsing
    questionnaire_data = {
        "career_goal": questionnaire.career_goal or "",
        "major": questionnaire.major or "",
        "education_level": questionnaire.education_level or "",
        "passions": questionnaire.passions.split(",") if questionnaire.passions else [],
        "institution": questionnaire.institution or "",
        "target_companies": questionnaire.target_companies.split(",") if questionnaire.target_companies else [],
        "skills": questionnaire.skills.split(",") if questionnaire.skills else [],
        "certifications": questionnaire.certifications.split(",") if questionnaire.certifications else [],
        "projects": questionnaire.projects or "",
        "experience": questionnaire.experience or "",
        "timeline": questionnaire.timeline or "",
        "learning_preference": questionnaire.learning_preference or "",
        "available_hours_per_week": questionnaire.available_hours_per_week or "",
    }
    
    return questionnaire_data

def get_videos_by_query(query: str, duration: str = "any", language: str = "en", num_videos: int = 1):
    """
    Get videos based on search query
    """
    return get_videos(query, duration, language, num_videos)

def get_roadmap_videos(db: Session, user_id: str):
    """
    Get videos based on user's roadmap
    """
    questionnaire_data = get_questionnaire_for_videos(db, user_id)
    
    if not questionnaire_data:
        return None, None, None, "Questionnaire not found"
    
    # Generate roadmap to get search terms
    roadmap_response = get_roadmap(questionnaire_data)
    
    # Handle different response types
    if hasattr(roadmap_response, 'text'):
        roadmap_text = roadmap_response.text
    elif isinstance(roadmap_response, str):
        roadmap_text = roadmap_response
    else:
        roadmap_text = str(roadmap_response)
    
    search_terms = extract_youtube_search_terms(roadmap_text)
    
    if not search_terms:
        return [], [], "", "No video search terms found in roadmap"
    
    # Get videos for first search term
    videos = get_videos(search_terms[0], "any", "en", 5)
    
    return videos, search_terms, search_terms[0], None 