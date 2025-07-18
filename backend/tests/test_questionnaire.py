import unittest
from unittest.mock import Mock, patch
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from app.main import app
from app.models.questionnaire import Questionnaire
from app.schemas.questionnaire import QuestionnaireCreate, QuestionnaireResponse

class TestQuestionnaireAPI(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(app)
        self.mock_db = Mock(spec=Session)
        
    def test_submit_questionnaire_success(self):
        """Test successful questionnaire submission"""
        questionnaire_data = {
            "user_id": 1,
            "career_goal": "Software Engineer",
            "major": ["Computer Science"],
            "education_level": "Bachelor's",
            "interests": ["AI", "Machine Learning"],
            "institution": "University of Technology",
            "target_companies": ["Google", "Microsoft"],
            "skills": ["Python", "JavaScript"],
            "certifications": ["AWS Certified"],
            "projects": ["Resume Parser"],
            "experience": ["Intern at TechCorp"],
            "timeline": "6 months",
            "learning_preference": "Video tutorials",
            "available_hours_per_week": "20"
        }
        
        with patch('app.api.questionnaire.upsert_questionnaire') as mock_upsert:
            mock_questionnaire = Questionnaire(
                id=1,
                user_id=1,
                career_goal="Software Engineer",
                major="Computer Science",
                education_level="Bachelor's",
                interests="AI, Machine Learning",
                institution="University of Technology",
                target_companies="Google, Microsoft",
                skills="Python, JavaScript",
                certifications="AWS Certified",
                projects="Resume Parser",
                experience="Intern at TechCorp",
                timeline="6 months",
                learning_preference="Video tutorials",
                available_hours_per_week="20"
            )
            mock_upsert.return_value = mock_questionnaire
            
            response = self.client.post("/api/questionnaire", json=questionnaire_data)
            
            self.assertEqual(response.status_code, 200)
            data = response.json()
            self.assertEqual(data["user_id"], 1)
            self.assertEqual(data["career_goal"], "Software Engineer")
            self.assertEqual(data["major"], ["Computer Science"])
            mock_upsert.assert_called_once()
    
    def test_get_questionnaire_success(self):
        """Test successful questionnaire retrieval"""
        with patch('app.api.questionnaire.get_questionnaire') as mock_get:
            mock_questionnaire = Questionnaire(
                id=1,
                user_id=1,
                career_goal="Software Engineer",
                major="Computer Science, Mathematics",
                education_level="Bachelor's",
                interests="AI, Machine Learning, Data Science",
                institution="University of Technology",
                target_companies="Google, Microsoft, Amazon",
                skills="Python, JavaScript, SQL",
                certifications="AWS Certified, Google Cloud",
                projects="Resume Parser, ML Model",
                experience="Intern at TechCorp, Research Assistant",
                timeline="6 months",
                learning_preference="Video tutorials",
                available_hours_per_week="20"
            )
            mock_get.return_value = mock_questionnaire
            
            response = self.client.get("/api/questionnaire/1")
            
            self.assertEqual(response.status_code, 200)
            data = response.json()
            self.assertEqual(data["user_id"], 1)
            self.assertEqual(data["career_goal"], "Software Engineer")
            self.assertEqual(data["major"], ["Computer Science", "Mathematics"])
            self.assertEqual(data["interests"], ["AI", "Machine Learning", "Data Science"])
            mock_get.assert_called_once()
    
    def test_get_questionnaire_not_found(self):
        """Test questionnaire retrieval when questionnaire doesn't exist"""
        with patch('app.api.questionnaire.get_questionnaire') as mock_get:
            mock_get.return_value = None
            
            response = self.client.get("/api/questionnaire/999")
            
            self.assertEqual(response.status_code, 404)
            data = response.json()
            self.assertEqual(data["detail"], "Questionnaire not found")
    
    def test_questionnaire_with_empty_lists(self):
        """Test questionnaire with empty string fields that should become empty lists"""
        questionnaire_data = {
            "user_id": 1,
            "career_goal": "Software Engineer",
            "major": [],
            "education_level": "Bachelor's",
            "interests": [],
            "institution": "University of Technology",
            "target_companies": [],
            "skills": [],
            "certifications": [],
            "projects": [],
            "experience": [],
            "timeline": "6 months",
            "learning_preference": "Video tutorials",
            "available_hours_per_week": "20"
        }
        
        with patch('app.api.questionnaire.upsert_questionnaire') as mock_upsert:
            mock_questionnaire = Questionnaire(
                id=1,
                user_id=1,
                career_goal="Software Engineer",
                major="",
                education_level="Bachelor's",
                interests="",
                institution="University of Technology",
                target_companies="",
                skills="",
                certifications="",
                projects="",
                experience="",
                timeline="6 months",
                learning_preference="Video tutorials",
                available_hours_per_week="20"
            )
            mock_upsert.return_value = mock_questionnaire
            
            response = self.client.post("/api/questionnaire", json=questionnaire_data)
            
            self.assertEqual(response.status_code, 200)
            data = response.json()
            self.assertEqual(data["major"], [])
            self.assertEqual(data["interests"], [])
            self.assertEqual(data["target_companies"], [])
            self.assertEqual(data["skills"], [])
            self.assertEqual(data["certifications"], [])
            self.assertEqual(data["projects"], [])
            self.assertEqual(data["experience"], [])

if __name__ == "__main__":
    unittest.main() 