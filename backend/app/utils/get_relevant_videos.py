import os
from dotenv import load_dotenv
import requests
import re

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
        return []

    video_list = []
    for video in videos:
        video_list.append({
            "title": video['snippet']['title'],
            "video_id": video['id']['videoId'],
            "url": f"https://www.youtube.com/watch?v={video['id']['videoId']}",
            "description": video['snippet']['description'],
            "thumbnail": video['snippet']['thumbnails']['default']['url']
        })
    
    return video_list