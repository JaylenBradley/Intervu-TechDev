<<<<<<< HEAD
from dotenv import load_dotenv
import os

load_dotenv()
=======
import os
from dotenv import load_dotenv

# Always load .env from the backend directory
base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
env_path = os.path.join(base_dir, '.env')
print("Loading .env from:", env_path)  # Debug print
load_dotenv(env_path)

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")
GOOGLE_PROJECT_ID = os.getenv("GOOGLE_PROJECT_ID")

# Debug print to verify loading
print("GOOGLE_CLIENT_ID:", GOOGLE_CLIENT_ID)
>>>>>>> justin/dev

class Settings:
    DATABASE_URL: str = os.getenv("DATABASE_URL")

settings = Settings()