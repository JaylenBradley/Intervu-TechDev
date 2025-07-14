from sqlalchemy.orm import Session
from app.models.questionnaire import Questionnaire
from app.utils.get_roadmap import get_roadmap

def get_questionnaire_for_roadmap(db: Session, user_id: str):
    """
    Get questionnaire data for roadmap generation
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

def generate_roadmap(db: Session, user_id: str):
    """
    Generate roadmap based on user's questionnaire
    """
    questionnaire_data = get_questionnaire_for_roadmap(db, user_id)
    
    if not questionnaire_data:
        return None
    
    # Call roadmap generation function
    roadmap_response = get_roadmap(questionnaire_data)
    
    # Handle different response types
    if hasattr(roadmap_response, 'text'):
        roadmap_text = roadmap_response.text
    elif isinstance(roadmap_response, str):
        roadmap_text = roadmap_response
    else:
        roadmap_text = str(roadmap_response)
    
    return roadmap_text 