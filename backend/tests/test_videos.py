import unittest
from unittest.mock import Mock, patch
from fastapi.testclient import TestClient
from app.main import app
from app.schemas.videos import VideoResponse, RoadmapVideoResponse

class TestVideosAPI(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(app)
        
    def test_get_videos_success(self):
        """Test successful video search"""
        with patch('app.api.videos.get_videos_by_query') as mock_get_videos:
            mock_videos = [
                {
                    "title": "Python Tutorial for Beginners",
                    "url": "https://www.youtube.com/watch?v=example1",
                    "duration": "15:30",
                    "channel": "Programming Hub",
                    "description": "Learn Python basics in this comprehensive tutorial"
                },
                {
                    "title": "JavaScript Fundamentals",
                    "url": "https://www.youtube.com/watch?v=example2",
                    "duration": "22:15",
                    "channel": "Code Academy",
                    "description": "Master JavaScript fundamentals"
                }
            ]
            mock_get_videos.return_value = mock_videos
            
            response = self.client.get("/api/videos?query=python+tutorial&duration=medium&language=en&num_videos=2")
            
            self.assertEqual(response.status_code, 200)
            data = response.json()
            self.assertEqual(len(data["videos"]), 2)
            self.assertEqual(data["videos"][0]["title"], "Python Tutorial for Beginners")
            mock_get_videos.assert_called_once_with("python tutorial", "medium", "en", 2)
    
    def test_get_videos_invalid_duration(self):
        """Test video search with invalid duration parameter"""
        response = self.client.get("/api/videos?query=python&duration=invalid&language=en&num_videos=1")
        
        self.assertEqual(response.status_code, 400)
        data = response.json()
        self.assertIn("Duration must be one of", data["detail"])
    
    def test_get_videos_with_different_parameters(self):
        """Test video search with various parameter combinations"""
        test_cases = [
            {"query": "machine learning", "duration": "short", "language": "en", "num_videos": 1},
            {"query": "data structures", "duration": "long", "language": "en", "num_videos": 3},
            {"query": "web development", "duration": "any", "language": "en", "num_videos": 5}
        ]
        
        with patch('app.api.videos.get_videos_by_query') as mock_get_videos:
            for test_case in test_cases:
                mock_videos = [{"title": f"Video for {test_case['query']}", "url": "https://example.com"}]
                mock_get_videos.return_value = mock_videos
                
                query_params = f"query={test_case['query']}&duration={test_case['duration']}&language={test_case['language']}&num_videos={test_case['num_videos']}"
                response = self.client.get(f"/api/videos?{query_params}")
                
                self.assertEqual(response.status_code, 200)
                data = response.json()
                self.assertEqual(len(data["videos"]), 1)
                mock_get_videos.assert_called_with(
                    test_case["query"],
                    test_case["duration"],
                    test_case["language"],
                    test_case["num_videos"]
                )
    
    def test_get_roadmap_videos_success(self):
        """Test successful roadmap video retrieval"""
        with patch('app.api.videos.get_roadmap_videos') as mock_get_roadmap_videos:
            mock_videos = [
                {
                    "title": "Python for Data Science",
                    "url": "https://www.youtube.com/watch?v=roadmap1",
                    "duration": "45:20",
                    "channel": "Data Science Hub",
                    "description": "Complete Python tutorial for data science"
                }
            ]
            mock_search_terms = ["python", "data science", "machine learning"]
            mock_selected_term = "python"
            
            mock_get_roadmap_videos.return_value = (mock_videos, mock_search_terms, mock_selected_term, None)
            
            response = self.client.get("/api/videos/roadmap/1")
            
            self.assertEqual(response.status_code, 200)
            data = response.json()
            self.assertEqual(len(data["videos"]), 1)
            self.assertEqual(data["search_terms"], mock_search_terms)
            self.assertEqual(data["selected_term"], mock_selected_term)
            # Check that message is None (not present or None)
            if "message" in data:
                self.assertIsNone(data["message"])
            mock_get_roadmap_videos.assert_called_once()
    
    def test_get_roadmap_videos_questionnaire_not_found(self):
        """Test roadmap video retrieval when questionnaire doesn't exist"""
        with patch('app.api.videos.get_roadmap_videos') as mock_get_roadmap_videos:
            mock_get_roadmap_videos.return_value = ([], [], "", "Questionnaire not found")
            
            response = self.client.get("/api/videos/roadmap/999")
            
            self.assertEqual(response.status_code, 404)
            data = response.json()
            self.assertEqual(data["detail"], "Questionnaire not found")
    
    def test_get_roadmap_videos_with_error_message(self):
        """Test roadmap video retrieval with error message"""
        with patch('app.api.videos.get_roadmap_videos') as mock_get_roadmap_videos:
            mock_get_roadmap_videos.return_value = ([], [], "", "Failed to generate search terms")
            
            response = self.client.get("/api/videos/roadmap/1")
            
            self.assertEqual(response.status_code, 200)
            data = response.json()
            self.assertEqual(data["videos"], [])
            self.assertEqual(data["search_terms"], [])
            self.assertEqual(data["selected_term"], "")
            self.assertEqual(data["message"], "Failed to generate search terms")
    
    def test_get_roadmap_videos_with_multiple_videos(self):
        """Test roadmap video retrieval with multiple videos"""
        with patch('app.api.videos.get_roadmap_videos') as mock_get_roadmap_videos:
            mock_videos = [
                {
                    "title": "Python Basics",
                    "url": "https://www.youtube.com/watch?v=python1",
                    "duration": "30:15",
                    "channel": "Programming Hub",
                    "description": "Learn Python fundamentals"
                },
                {
                    "title": "Data Structures in Python",
                    "url": "https://www.youtube.com/watch?v=python2",
                    "duration": "45:30",
                    "channel": "Code Academy",
                    "description": "Master data structures"
                },
                {
                    "title": "Algorithms and Problem Solving",
                    "url": "https://www.youtube.com/watch?v=python3",
                    "duration": "60:00",
                    "channel": "Algorithm Master",
                    "description": "Advanced problem solving techniques"
                }
            ]
            mock_search_terms = ["python", "data structures", "algorithms"]
            mock_selected_term = "data structures"
            
            mock_get_roadmap_videos.return_value = (mock_videos, mock_search_terms, mock_selected_term, None)
            
            response = self.client.get("/api/videos/roadmap/1")
            
            self.assertEqual(response.status_code, 200)
            data = response.json()
            self.assertEqual(len(data["videos"]), 3)
            self.assertEqual(data["videos"][0]["title"], "Python Basics")
            self.assertEqual(data["videos"][1]["title"], "Data Structures in Python")
            self.assertEqual(data["videos"][2]["title"], "Algorithms and Problem Solving")
            self.assertEqual(data["selected_term"], "data structures")
    
    def test_get_videos_with_edge_cases(self):
        """Test video search with edge cases"""
        with patch('app.api.videos.get_videos_by_query') as mock_get_videos:
            # Test with minimum num_videos
            mock_get_videos.return_value = [{"title": "Single Video", "url": "https://example.com"}]
            response = self.client.get("/api/videos?query=test&num_videos=1")
            self.assertEqual(response.status_code, 200)
            
            # Test with maximum num_videos
            mock_get_videos.return_value = [{"title": f"Video {i}", "url": "https://example.com"} for i in range(10)]
            response = self.client.get("/api/videos?query=test&num_videos=10")
            self.assertEqual(response.status_code, 200)
            data = response.json()
            self.assertEqual(len(data["videos"]), 10)
            
            # Test with empty query
            response = self.client.get("/api/videos?query=&num_videos=1")
            self.assertEqual(response.status_code, 200)

if __name__ == "__main__":
    unittest.main() 