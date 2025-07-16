from app.models.user import User

@router.post("/jobs", response_model=JobApplicationResponse)
def create_application(job_data: JobApplicationCreate, db: Session = Depends(get_db)):
    # Assume frontend sends firebase_id in job_data (or as a separate field)
    firebase_id = getattr(job_data, 'firebase_id', None)
    if not firebase_id:
        raise HTTPException(status_code=400, detail="firebase_id is required")
    user = db.query(User).filter(User.firebase_id == firebase_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    job_data.user_id = user.id  # Set to integer user.id
    return create_job_application(db, job_data) 