import pytest
from fastapi.testclient import TestClient
from app.main import app
import json

client = TestClient(app)

def test_export_tailored_resume():
    """Test that the tailored resume export endpoint works correctly."""
    
    # Sample tailored resume data
    tailored_resume_data = {
        "contact_info": {
            "name": "John Doe",
            "email": "john.doe@example.com",
            "phone": "123-456-7890"
        },
        "education": [
            {
                "institution": "University of Example",
                "degree": "Bachelor of Science in Computer Science",
                "start_date": "2018-09",
                "end_date": "2022-05"
            }
        ],
        "experience": [
            {
                "company": "Tech Corp",
                "title": "Software Engineer",
                "start_date": "2022-06",
                "end_date": "2024-01",
                "description": [
                    "Developed and maintained web applications using React and Node.js.",
                    "Collaborated with cross-functional teams to deliver high-quality software solutions."
                ]
            }
        ],
        "skills": ["JavaScript", "React", "Node.js", "Python"],
        "projects": [
            {
                "name": "E-commerce Platform",
                "description": [
                    "Built a full-stack e-commerce application with React frontend and Node.js backend.",
                    "Implemented user authentication and payment processing functionality."
                ]
            }
        ]
    }
    
    # Test PDF export
    response = client.post(
        "/api/resume/export-tailored",
        data={
            "user_id": "1",
            "format": "pdf",
            "tailored_resume": json.dumps(tailored_resume_data)
        }
    )
    
    assert response.status_code == 200
    assert response.headers["content-type"] == "application/pdf"
    assert "tailored_resume.pdf" in response.headers.get("content-disposition", "")
    
    # Test DOCX export
    response = client.post(
        "/api/resume/export-tailored",
        data={
            "user_id": "1",
            "format": "docx",
            "tailored_resume": json.dumps(tailored_resume_data)
        }
    )
    
    assert response.status_code == 200
    assert response.headers["content-type"] == "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    assert "tailored_resume.docx" in response.headers.get("content-disposition", "")

def test_export_tailored_resume_invalid_json():
    """Test that the endpoint handles invalid JSON gracefully."""
    
    response = client.post(
        "/api/resume/export-tailored",
        data={
            "user_id": "1",
            "format": "pdf",
            "tailored_resume": "invalid json"
        }
    )
    
    assert response.status_code == 400
    assert "Invalid tailored resume format" in response.json()["detail"]

def test_export_tailored_resume_invalid_format():
    """Test that the endpoint handles invalid format gracefully."""
    
    tailored_resume_data = {
        "contact_info": {"name": "John Doe"},
        "experience": []
    }
    
    response = client.post(
        "/api/resume/export-tailored",
        data={
            "user_id": "1",
            "format": "invalid",
            "tailored_resume": json.dumps(tailored_resume_data)
        }
    )
    
    assert response.status_code == 400
    assert "Invalid format" in response.json()["detail"] 