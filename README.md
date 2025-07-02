# Navia

Navia is a Python-based application designed to help users navigate career development in technology. It features an interactive questionnaire and generates personalized roadmaps based on user input.

## Features

- Interactive command-line interface
- Career questionnaire with dynamic branching
- Personalized roadmap generation
- Modular and extensible Python codebase

## Prerequisites

- Python 3.8 or higher
- `git` (for cloning the repository)

## API Keys

This project requires API keys for the YouTube Data API and Gemini API.

1. [Get a YouTube Data API key](https://console.developers.google.com/apis/library/youtube.googleapis.com)
2. [Get a Gemini API key](https://ai.google.dev/gemini-api/docs/api-key)

Create a `.env` file in the project root with the following content:

```bash
YOUTUBE_API_KEY=your_youtube_api_key
GENAI_API_KEY=your_gemini_api_key
DB_PATH=your_database_name.db
```

> The application uses [`python-dotenv`](https://pypi.org/project/python-dotenv/) 
> to automatically load environment variables from the `.env` file. 
> No manual loading is required.

## Getting Started

Follow these steps to set up and run the project locally:

### 1. Clone the Repository

```bash
git clone https://github.com/JaylenBradley/Navia.git
cd Navia
````

### 2. (Optional) Create a Virtual Environment

```bash
python3 -m venv venv
source venv/bin/activate
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Run the Application

```bash
python main.py
```

## Usage
* Follow the on-screen prompts to complete the questionnaire.
* View your personalized career roadmap at the end.
