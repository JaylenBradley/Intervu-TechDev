from app.models.user import User
from app.models.resume import Resume
from app.models.questionnaire import Questionnaire
from app.models.job_description_roadmap import JobDescriptionRoadmap
from app.utils.get_job_description_roadmap import get_job_description_roadmap

def create_jobdesc_roadmap(db, data):
    questionnaire = db.query(Questionnaire).filter(Questionnaire.user_id == data.user_id).first()
    profile = questionnaire.data if questionnaire else ""

    resume_obj = db.query(Resume).filter(Resume.user_id == data.user_id).first()
    resume = resume_obj.resume_text if resume_obj else ""

    roadmap_json = get_job_description_roadmap(profile, resume, data.job_description)

    roadmap = JobDescriptionRoadmap(
        user_id=data.user_id,
        job_description=data.job_description,
        roadmap_json=roadmap_json
    )
    db.add(roadmap)
    db.commit()
    db.refresh(roadmap)
    return roadmap

def list_jobdesc_roadmaps(db: Session, user_id: int):
    return db.query(JobDescriptionRoadmap).filter(JobDescriptionRoadmap.user_id == user_id).all()

def get_jobdesc_roadmap(db: Session, roadmap_id: str):
    return db.query(JobDescriptionRoadmap).filter(JobDescriptionRoadmap.id == roadmap_id).first()

def delete_jobdesc_roadmap(db: Session, roadmap_id: str):
    roadmap = db.query(JobDescriptionRoadmap).filter(JobDescriptionRoadmap.id == roadmap_id).first()
    if not roadmap:
        return False
    db.delete(roadmap)
    db.commit()
    return True