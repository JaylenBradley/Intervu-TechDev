# Intervu

Intervu is an AI-powered career planning and interview preparation platform. 
It features a React frontend and a Python backend, helping users generate personalized roadmaps, practice technical & behavioral interviews, and improve resumes.

## Features
- Modern React web interface
- User authentication (Firebase)
- Personalized career roadmap generation
- Technical & behavioral interview prep with AI feedback
- Resume improvement and feedback
- Job tracking and milestone monitoring
- Integration with Google Cloud Speech-to-Text and Google Sheets APIs

## Prerequisites
- Python 3.8 or higher
- Node.js 18.x
- npm or Yarn (package manager for Node.js)
- Git (used to clone the repository)
- PostgreSQL (for the database)

## API Keys
You will need API keys for:
- [Firebase](https://console.firebase.google.com/u/0/)
- [Gemini API](https://aistudio.google.com/prompts/new_chat)
- [Google Cloud Speech-to-Text API](https://console.cloud.google.com/apis/api/speech.googleapis.com/metrics?inv=1&invt=Ab3Xzw&project=gen-lang-client-0080872580)
- [Google Sheets API](https://console.cloud.google.com/apis/api/sheets.googleapis.com/metrics?inv=1&invt=Ab3Xzw&project=gen-lang-client-0080872580)

Create a `.env` file in the root of the backend directory with the following content:

```bash
GENAI_API_KEY=your_gemini_api_key
GOOGLE_APPLICATION_CREDENTIALS=your_google_speech_api_key
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
- Add your API keys to the .env file in `backend/`
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
- Access interview prep, resume feedback, and job tracking features

## Directory Structure
- `backend/` — Python FastAPI backend, business logic, API integrations
- `frontend/` — React app, UI components, pages, services
