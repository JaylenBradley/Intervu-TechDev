# Intervu

Intervu is an AI-powered career planning and interview preparation platform. 
It features a React frontend and a FastAPI backend, helping users generate personalized roadmaps, practice technical & behavioral interviews, track jobs, and improve resumes

## Features
- User authentication (Firebase)
- User profile with the ability to follow friends, manage account, and view leaderboard
- Personalized career & skill gap roadmap generation
- Technical & behavioral interview prep with AI feedback
- Job tracking and milestone monitoring with the ability to export data

- Resume improvement, feedback and tailoring

## Prerequisites
- Python 3.8 or higher
- Node.js 18.x
- npm or Yarn (package manager for Node.js)
- Git (used to clone the repository)
- PostgreSQL (for the database)

## API Keys
You will need API keys for:
- [Firebase](https://console.firebase.google.com/u/0/)
- [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)
- [Gemini API](https://aistudio.google.com/prompts/new_chat)
- [Google Cloud Speech-to-Text API](https://console.cloud.google.com/apis/api/speech.googleapis.com/metrics?inv=1&invt=Ab3Xzw&project=gen-lang-client-0080872580)
- [Google Sheets API](https://console.cloud.google.com/apis/api/sheets.googleapis.com/metrics?inv=1&invt=Ab3Xzw&project=gen-lang-client-0080872580)

Create a `.env` file in the root of the backend directory with the following content:

```bash
FIREBASE_CREDENTIALS=app/your_firebase_admin_sdk_credentials_json
GENAI_API_KEY=your_gemini_api_key
GOOGLE_APPLICATION_CREDENTIALS=app/your_google_speech_credentials_json
GOOGLE_CLIENT_ID=from_your_google_sheets_api_key
GOOGLE_CLIENT_SECRET=from_your_google_sheets_api_key
GOOGLE_PROJECT_ID=from_your_google_sheets_api_key
DATABASE_URL=your_postgress_url
```

Create a `.env` file in the root of the frontend directory with the following content:
```bash
VITE_FIREBASE_API_KEY=your_firebase_key
VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
VITE_FIREBASE_APP_ID=your_firebase_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_firebase_measurement_id

VITE_BACKEND_URL=your_backend_url
```

> The application uses [`python-dotenv`](https://pypi.org/project/python-dotenv/) 
> to automatically load environment variables from the `.env` file. 
> No manual loading is required.

## Getting Started

Follow these steps to set up and run the project locally:

### 1. Clone the Repository

```bash
git clone https://github.com/JaylenBradley/Intervu-TechDev.git
cd Intervu-TechDev
````

### 2. Backend Setup

```bash
cd backend
python3 -m venv env
source env/bin/activate
pip install -r requirements.txt
```
The backend requires a PostgreSQL database. You can use Neon or any compatible PostgreSQL provider.
Set your connection string in DATABASE_URL in the .env file

### 3. Frontend Setup
```bash
cd ../frontend
npm install
```

### 4. Environment Configuration
- Add your API keys to the .env files in `backend/` and `frontend/`
- Configure Firebase in `frontend/src/services/firebase.js`

### 5. Running the Application
- Backend (from `backend/`):
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```
- Frontend (from `frontend/`):
```bash
npm run dev
```

## Usage
- Sign up and log in via the web interface
- Complete the questionnaire to generate your personalized roadmap
- Access interview prep, job tracking features, and resume tools

## Directory Structure
- `backend/` — FastAPI backend, business logic, API integrations
- `frontend/` — React app, UI components, pages, services
