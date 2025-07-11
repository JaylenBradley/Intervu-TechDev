from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import roadmap, videos

# Create FastAPI app
app = FastAPI(
    title="Intervu API",
    description="Interview and Career Planning Platform API",
    version="1.0.0"
)

# CORS middleware for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],  # React dev servers
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(roadmap.router, prefix="/api", tags=["Roadmap"])
app.include_router(videos.router, prefix="/api", tags=["Videos"])

@app.get("/")
async def root():
    return {"message": "Intervu API is running!"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
