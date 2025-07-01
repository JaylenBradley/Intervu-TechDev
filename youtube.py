import os
from dotenv import load_dotenv
import requests
import sqlalchemy as db
import pandas as pd

load_dotenv()
url = 'https://www.googleapis.com/youtube/v3/search'
api_key = os.getenv('YOUTUBE_API_KEY')

params = {
    'part': 'snippet',
    'q': 'python tutorial',
    'type': 'video',
    'maxResults': 1,
    'key': api_key
}

response = requests.get(url, params=params)
data = response.json()

# Extract the 'items' list and flatten it into a DataFrame
items = data.get('items', [])
if not items:
    print("No videos found.")
    exit()

# Flatten nested JSON fields (e.g., 'snippet.channelTitle')
youtube_df = pd.json_normalize(items)

engine = db.create_engine('sqlite:///youtube_test.db')
youtube_df.to_sql('youtube_videos', con=engine, if_exists='replace', index=False)
with engine.connect() as connection:
   query_result = connection.execute(db.text("SELECT * FROM youtube_videos;")).fetchall()
   print(pd.DataFrame(query_result))