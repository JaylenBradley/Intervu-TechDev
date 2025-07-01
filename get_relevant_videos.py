import os
from dotenv import load_dotenv
import requests

load_dotenv()
url = 'https://www.googleapis.com/youtube/v3/search'
api_key = os.getenv('YOUTUBE_API_KEY')

def get_videos(query, vid_duration):
    params = {
        'part': 'snippet',
        'q': query,
        'type': 'video',
        'order': 'title',
        'safeSearch': 'moderate',
        'videoDuration': vid_duration,
        'maxResults': 5,
        'key': api_key
    }

    response = requests.get(url, params=params)
    data = response.json()

    videos = data.get('items', [])
    if not videos:
        print("No videos found.")
        exit()
    else:
        print("Here are a few videos you might find helpful based on you're questionnaire")
        print("-" * 50)

        for i in range(len(videos)):
            title = videos[i]['snippet']['title']
            video_id = videos[i]['id']['videoId']

            print(f"{title}: https://www.youtube.com/watch?v={video_id}")