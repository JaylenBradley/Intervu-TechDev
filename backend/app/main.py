from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
<<<<<<< HEAD
from app.api import roadmap, videos, questionnaire, user, jobs
from app.core.database import Base, engine
=======
from app.api import roadmap, videos, questionnaire, user, jobs, resume
from app.core.database import Base, engine
from dotenv import load_dotenv
load_dotenv()
>>>>>>> justin/dev

# Create FastAPI app
app = FastAPI(
    title="Intervu API",
    description="Interview and Career Planning Platform API",
    version="1.0.0"
)

# CORS middleware for frontend integration
app.add_middleware(
    CORSMiddleware,
<<<<<<< HEAD
    allow_origins=["http://localhost:3000", "http://localhost:5173"],  # React dev servers
=======
    allow_origins=["http://localhost:3000", "http://localhost:5173", "http://localhost:5174"],  # React dev servers
>>>>>>> justin/dev
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(roadmap.router, prefix="/api", tags=["Roadmap"])
app.include_router(videos.router, prefix="/api", tags=["Videos"])
app.include_router(questionnaire.router, prefix="/api", tags=["Questionnaire"])
app.include_router(user.router, prefix="/api", tags=["User"])
app.include_router(jobs.router, prefix="/api", tags=["Jobs"])
<<<<<<< HEAD
=======
app.include_router(resume.router, prefix="/api", tags=["Resume"])
>>>>>>> justin/dev

# Create tables at startup
@app.on_event("startup")
def on_startup():
    Base.metadata.create_all(bind=engine)

@app.get("/")
async def root():
    return {"message": "Intervu API is running!"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}