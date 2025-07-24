from sqlalchemy.orm import Session
from app.models.user import User
from app.models.resume import Resume
from app.models.questionnaire import Questionnaire
from app.models.job_description_roadmap import JobDescriptionRoadmap
from app.utils.get_job_description_roadmap import generate_job_description_roadmap

def create_job_description_roadmap(db: Session, data):
    questionnaire = db.query(Questionnaire).filter(Questionnaire.user_id == data.user_id).first()
    profile = ""
    if questionnaire:
        profile = {
            "career_goal": questionnaire.career_goal,
            "major": questionnaire.major,
            "minor": questionnaire.minor,
            "education_level": questionnaire.education_level,
            "interests": questionnaire.interests,
            "institution": questionnaire.institution,
            "target_companies": questionnaire.target_companies,
            "skills": questionnaire.skills,
            "certifications": questionnaire.certifications,
            "projects": questionnaire.projects,
            "experience": questionnaire.experience,
            "timeline": questionnaire.timeline,
            "learning_preference": questionnaire.learning_preference,
            "available_hours_per_week": questionnaire.available_hours_per_week,
        }

    resume_obj = (
        db.query(Resume)
        .filter(Resume.user_id == data.user_id)
        .first()
    )

    skills = ""
    if resume_obj and hasattr(resume_obj, "parsed_data") and resume_obj.parsed_data:
        skills = resume_obj.parsed_data.get("skills", "")
    skills_str = ", ".join(skills) if isinstance(skills, list) else str(skills)

    job_description_roadmap_json = generate_job_description_roadmap(profile, skills_str, data.job_description)

    job_description_roadmap = JobDescriptionRoadmap(
        user_id=data.user_id,
        job_description=data.job_description,
        roadmap_json=job_description_roadmap_json
    )
    db.add(job_description_roadmap)
    db.commit()
    db.refresh(job_description_roadmap)
    return job_description_roadmap

def get_job_description_roadmaps_by_user(db: Session, user_id: int):
    return db.query(JobDescriptionRoadmap).filter(JobDescriptionRoadmap.user_id == user_id).order_by(
        JobDescriptionRoadmap.created_at.desc()).all()

def get_job_description_roadmap(db: Session, roadmap_id: str):
    return db.query(JobDescriptionRoadmap).filter(JobDescriptionRoadmap.id == roadmap_id).first()

def delete_job_description_roadmap(db: Session, roadmap_id: str):
    roadmap = db.query(JobDescriptionRoadmap).filter(JobDescriptionRoadmap.id == roadmap_id).first()
    if not roadmap:
        return False
    db.delete(roadmap)
    db.commit()
    return True