from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import roadmap, videos, questionnaire, user, jobs, resume, interview, behavioral_prep
from app.core.database import Base, engine
from dotenv import load_dotenv

app = FastAPI(
    title="Intervu API",
    description="Interview and Career Planning Platform API",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173", "http://localhost:5174"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(behavioral_prep.router, prefix="/api", tags=["Behavioral Prep"])
app.include_router(interview.router, prefix="/api", tags=["Interview"])
app.include_router(jobs.router, prefix="/api", tags=["Jobs"])
app.include_router(questionnaire.router, prefix="/api", tags=["Questionnaire"])
app.include_router(resume.router, prefix="/api", tags=["Resume"])
app.include_router(roadmap.router, prefix="/api", tags=["Roadmap"])
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