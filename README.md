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
- Node.js 18
- npm or yarn
- `git` (for cloning the repository)
- PostgreSQL database

## API Keys
You will need API keys for:
- Gemini API
- Google Cloud Speech-to-Text API
- Google Sheets API
- Firebase (for authentication)

Create a `.env` file in the project root with the following content:

```bash
GENAI_API_KEY=your_gemini_api_key
GOOGLE_SPEECH_API_KEY=your_google_speech_api_key
GOOGLE_SHEETS_API_KEY=your_google_sheets_api_key
DATABASE_URL=your_postgress_url
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
