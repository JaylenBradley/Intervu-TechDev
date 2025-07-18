import unittest
from unittest.mock import Mock, patch
from fastapi.testclient import TestClient
from app.main import app
from app.schemas.behavioral_prep import (
    BehavioralQuestionsRequest,
    BehavioralQuestionsResponse,
    BehavioralFeedbackRequest,
    BehavioralFeedbackResponse
)

class TestBehavioralPrepAPI(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(app)
        
    def test_get_behavioral_questions_success(self):
        """Test successful behavioral questions generation"""
        request_data = {
            "target_role": "Software Engineer",
            "seniority": "Mid-level",
            "company": "Google",
            "num_questions": 3,
            "difficulty": "Medium"
        }
        
        with patch('app.api.behavioral_prep.generate_behavioral_questions') as mock_generate:
            mock_questions = [
                "Tell me about a time when you had to work with a difficult team member.",
                "Describe a project where you had to learn a new technology quickly.",
                "How do you handle competing deadlines?"
            ]
            mock_generate.return_value = mock_questions
            
            response = self.client.post("/api/behavioral-prep/questions", json=request_data)
            
            self.assertEqual(response.status_code, 200)
            data = response.json()
            self.assertEqual(data["questions"], mock_questions)
            mock_generate.assert_called_once_with(
                "Software Engineer", "Mid-level", "Google", 3, "Medium"
            )
    
    def test_get_behavioral_feedback_success(self):
        """Test successful behavioral feedback generation"""
        request_data = {
            "target_role": "Data Scientist",
            "seniority": "Senior",
            "company": "Facebook",
            "question": "Tell me about a time when you had to explain a complex concept to a non-technical stakeholder.",
            "answer": "I was working on a machine learning project and had to present the results to marketing team...",
            "difficulty": "Hard"
        }
        
        with patch('app.api.behavioral_prep.generate_behavioral_feedback') as mock_generate:
            mock_feedback = "Excellent answer! You demonstrated strong communication skills and technical knowledge..."
            mock_generate.return_value = mock_feedback
            
            response = self.client.post("/api/behavioral-prep/feedback", json=request_data)
            
            self.assertEqual(response.status_code, 200)
            data = response.json()
            self.assertEqual(data["feedback"], mock_feedback)
            mock_generate.assert_called_once_with(
                "Data Scientist", "Senior", "Facebook", 
                "Tell me about a time when you had to explain a complex concept to a non-technical stakeholder.",
                "I was working on a machine learning project and had to present the results to marketing team...",
                "Hard"
            )
    
    def test_transcribe_audio_success(self):
        """Test successful audio transcription"""
        # Create a mock audio file
        audio_content = b"mock audio content"
        
        with patch('app.api.behavioral_prep.transcribe_audio') as mock_transcribe:
            mock_transcript = "This is a test transcription of the audio content."
            mock_transcribe.return_value = mock_transcript
            
            response = self.client.post(
                "/api/behavioral-prep/transcribe",
                files={"audio": ("test_audio.webm", audio_content, "audio/webm")}
            )
            
            self.assertEqual(response.status_code, 200)
            data = response.json()
            self.assertEqual(data["transcript"], mock_transcript)
            mock_transcribe.assert_called_once()
    
    def test_transcribe_audio_no_file(self):
        """Test audio transcription with no file provided"""
        response = self.client.post("/api/behavioral-prep/transcribe")
        
        self.assertEqual(response.status_code, 422)  # Validation error
    
    def test_behavioral_questions_with_different_parameters(self):
        """Test behavioral questions with various parameter combinations"""
        test_cases = [
            {
                "target_role": "Frontend Developer",
                "seniority": "Junior",
                "company": "Startup",
                "num_questions": 1,
                "difficulty": "Easy"
            },
            {
                "target_role": "Backend Engineer",
                "seniority": "Senior",
                "company": "Microsoft",
                "num_questions": 5,
                "difficulty": "Hard"
            }
        ]
        
        with patch('app.api.behavioral_prep.generate_behavioral_questions') as mock_generate:
            for i, test_case in enumerate(test_cases):
                mock_questions = [f"Question {j+1} for test case {i+1}" for j in range(test_case["num_questions"])]
                mock_generate.return_value = mock_questions
                
                response = self.client.post("/api/behavioral-prep/questions", json=test_case)
                
                self.assertEqual(response.status_code, 200)
                data = response.json()
                self.assertEqual(len(data["questions"]), test_case["num_questions"])
                mock_generate.assert_called_with(
                    test_case["target_role"],
                    test_case["seniority"],
                    test_case["company"],
                    test_case["num_questions"],
                    test_case["difficulty"]
                )
    
    def test_behavioral_feedback_with_long_answer(self):
        """Test behavioral feedback with a detailed, long answer"""
        request_data = {
            "target_role": "Product Manager",
            "seniority": "Mid-level",
            "company": "Amazon",
            "question": "Describe a situation where you had to make a difficult decision with limited information.",
            "answer": "In my previous role as a product manager, I was tasked with deciding whether to launch a new feature that had been in development for 3 months. The feature was designed to improve user engagement, but we had limited data on its potential impact. I had to consider several factors: the development resources already invested, the potential revenue impact, user feedback from beta testing, and the competitive landscape. I decided to launch the feature with a phased rollout approach, starting with 10% of users to gather real-world data before expanding. This approach allowed us to minimize risk while still moving forward. The feature ultimately increased user engagement by 15% and became one of our most successful launches.",
            "difficulty": "Medium"
        }
        
        with patch('app.api.behavioral_prep.generate_behavioral_feedback') as mock_generate:
            mock_feedback = "Strong answer demonstrating structured thinking and risk management..."
            mock_generate.return_value = mock_feedback
            
            response = self.client.post("/api/behavioral-prep/feedback", json=request_data)
            
            self.assertEqual(response.status_code, 200)
            data = response.json()
            self.assertEqual(data["feedback"], mock_feedback)

if __name__ == "__main__":
    unittest.main() 