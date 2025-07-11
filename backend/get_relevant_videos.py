import os
from dotenv import load_dotenv
import requests
import re
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db, Questionnaire, User
from app.services.auth import get_current_user
from datetime import datetime

load_dotenv()
url = 'https://www.googleapis.com/youtube/v3/search'
api_key = os.getenv('YOUTUBE_API_KEY')

def extract_youtube_search_terms(gemini_output):
    pattern = re.compile(r'^\s*-\s*\[YouTube\]\s*(.+)$', re.MULTILINE | re.IGNORECASE)
    return pattern.findall(gemini_output)

def get_videos(query, vid_duration, language='en', num_videos=1):
    params = {
        'part': 'snippet',
        'q': query,
        'type': 'video',
        'safeSearch': 'moderate',
        'videoDuration': vid_duration,
        'relevanceLanguage': language,
        'maxResults': num_videos,
        'key': api_key
    }

    response = requests.get(url, params=params)
    data = response.json()

    videos = data.get('items', [])
    if not videos:
        return []  # Return empty list instead of printing
    
    # Convert to JSON format
    video_list = []
    for video in videos:
        video_list.append({
            "title": video['snippet']['title'],
            "video_id": video['id']['videoId'],
            "url": f"https://www.youtube.com/watch?v={video['id']['videoId']}",
            "description": video['snippet']['description'],
            "thumbnail": video['snippet']['thumbnails']['default']['url']
        })
    
    return video_list  # Return list instead of printing

# Create router
router = APIRouter()

@router.get("/api/videos")
async def get_videos_endpoint(
    query: str,
    duration: str = "any",
    language: str = "en", 
    num_videos: int = 1,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Validate parameters
    valid_durations = ['any', 'short', 'medium', 'long']
    if duration not in valid_durations:
        raise HTTPException(status_code=400, detail=f"Duration must be one of: {valid_durations}")
    
    if num_videos < 1 or num_videos > 10:
        raise HTTPException(status_code=400, detail="num_videos must be between 1 and 10")
    
    # Call original function
    videos = get_videos(query, duration, language, num_videos)
    
    # Return JSON instead of printing
    return {"videos": videos}

@router.get("/api/videos/roadmap")
async def get_roadmap_videos_endpoint(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Get user's questionnaire
    questionnaire = db.query(Questionnaire).filter(Questionnaire.user_id == current_user.id).first()
    
    if not questionnaire:
        raise HTTPException(status_code=404, detail="Questionnaire not found")
    
    # Generate roadmap to get search terms
    from get_roadmap import get_roadmap
    
    questionnaire_data = {
        "career_goal": questionnaire.career_goal,
        "major": questionnaire.major,
        "education_level": questionnaire.education_level,
        "passions": questionnaire.passions.split(",") if questionnaire.passions else [],
        "institution": questionnaire.institution,
        "target_companies": questionnaire.target_companies.split(",") if questionnaire.target_companies else [],
        "skills": questionnaire.skills.split(",") if questionnaire.skills else [],
        "certifications": questionnaire.certifications.split(",") if questionnaire.certifications else [],
        "projects": questionnaire.projects,
        "experience": questionnaire.experience,
        "timeline": questionnaire.timeline,
        "learning_preference": questionnaire.learning_preference,
        "available_hours_per_week": questionnaire.available_hours_per_week,
    }
    
    roadmap_response = get_roadmap(questionnaire_data)
    search_terms = extract_youtube_search_terms(roadmap_response.text)
    
    if not search_terms:
        return {"videos": [], "message": "No video search terms found in roadmap"}
    
    # Get videos for first search term
    videos = get_videos(search_terms[0], "any", "en", 5)
    
    return {
        "videos": videos,
        "search_terms": search_terms,
        "selected_term": search_terms[0]
    }