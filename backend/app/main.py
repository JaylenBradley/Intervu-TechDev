import os

# Use the secret path in production, fallback to local path in development
if os.path.exists("/etc/secrets/google-application-credentials.json"):
    os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = "/etc/secrets/google-application-credentials.json"
else:
    local_path = os.path.join(os.path.dirname(__file__), "../app/gen-lang-client-0080872580-2e4a0982c79c.json")
    os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = local_path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import behavioral_prep, blind_75, daily_practice, interview, jobs, job_description_roadmap, questionnaire, resume, roadmap, user, videos
from app.core.database import Base, engine

app = FastAPI(
    title="Intervu API",
    description="Interview and Career Planning Platform API",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:5174",
        "https://useintervu.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(behavioral_prep.router, prefix="/api", tags=["Behavioral Prep"])
app.include_router(blind_75.router, prefix="/api", tags=["Blind75"])
app.include_router(daily_practice.router, prefix="/api", tags=["Daily Practice"])
app.include_router(roadmap.router, prefix="/api", tags=["CareerGoalRoadmap"])
app.include_router(interview.router, prefix="/api", tags=["Interview"])
app.include_router(jobs.router, prefix="/api", tags=["Jobs"])
app.include_router(job_description_roadmap.router, prefix="/api", tags=["JobDescriptionRoadmap"])
app.include_router(questionnaire.router, prefix="/api", tags=["Questionnaire"])
app.include_router(resume.router, prefix="/api", tags=["Resume"])
app.include_router(user.router, prefix="/api", tags=["User"])
app.include_router(videos.router, prefix="/api", tags=["Videos"])

@app.on_event("startup")
def on_startup():
    Base.metadata.create_all(bind=engine)

@app.get("/")
async def root():
    return {"message": "Intervu API is running!"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}