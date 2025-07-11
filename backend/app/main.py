# backend/app/main.py
from fastapi import FastAPI
from app.api import questionnaire
from app.core.database import Base, engine

app = FastAPI(
    title="Navia Career Navigator",
    description="AI-powered career advisor and coach.",
    version="1.0.0"
)

# Register routers
app.include_router(questionnaire.router, prefix="/api", tags=["questionnaire"])

# Create tables at startup
@app.on_event("startup")
def on_startup():
    Base.metadata.create_all(bind=engine)