import os
import json
import uuid
import random
from google import genai
from google.genai import types
import logging

genai.api_key = os.getenv('GEMINI_API_KEY')
client = genai.Client(api_key=genai.api_key)

def generate_leetcode_questions(user_profile, target_company, difficulty, num_questions):
    """
    Generate LeetCode questions using Gemini API based on user profile and preferences
    """
    import time
    import datetime
    random_seed = int(time.time() * 1000) % 10000
    current_time = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    
    prompt = f"""
Generate {num_questions} unique and random LeetCode-style coding questions for a {difficulty} level interview.
RANDOM SEED: {random_seed}
TIMESTAMP: {current_time}
Use this seed to ensure the questions are different each time and not repeated.
Make the questions in the style of company {target_company} interviews.
Return ONLY a valid JSON array of question objects, with each object containing:
- id (string)
- title (string)
- description (string)
- difficulty (string)
- category (string)
- hints (list of strings)
- expected_approach (string)
- time_complexity (string)
- space_complexity (string)
No explanations, no markdown, no extra text.
"""
    
    # Convert user profile to string format
    profile_str = f"""
    Career Goal: {user_profile.career_goal or 'Not specified'}
    Major: {user_profile.major or 'Not specified'}
    Education Level: {user_profile.education_level or 'Not specified'}
    Skills: {user_profile.skills or 'Not specified'}
    Experience: {user_profile.experience or 'Not specified'}
    Projects: {user_profile.projects or 'Not specified'}
    """
    
    try:
        response = client.models.generate_content(
            model="gemini-2.0-flash-exp",
            config=types.GenerateContentConfig(
                temperature=0.9,
                max_output_tokens=4000
            ),
            contents=prompt
        )
        questions_text = response.text.strip()
        if questions_text.startswith('```json'):
            questions_text = questions_text[7:-3]
        elif questions_text.startswith('```'):
            questions_text = questions_text[3:-3]
        try:
            questions_data = json.loads(questions_text)
        except json.JSONDecodeError as json_err:
            logging.error(f"Gemini returned invalid JSON: {json_err} | Partial response: {questions_text[:500]}")
            return get_fallback_questions(difficulty, num_questions)
        for question in questions_data:
            if 'id' not in question or not question['id']:
                question['id'] = str(uuid.uuid4())
            if 'difficulty' in question:
                difficulty_val = question['difficulty']
                if isinstance(difficulty_val, str):
                    difficulty_val = difficulty_val.replace('DifficultyLevel.', '').lower()
                    question['difficulty'] = difficulty_val
        return questions_data
    except Exception as e:
        # Check for Gemini 503 error (model overloaded)
        if hasattr(e, 'args') and e.args and '503' in str(e.args[0]):
            logging.error(f"Gemini model overloaded (503): {e}")
            return get_fallback_questions(difficulty, num_questions)
        logging.error(f"Error generating questions: {e}")
        print(f"Response text: {response.text if 'response' in locals() and hasattr(response, 'text') else 'No response text'}")
        return get_fallback_questions(difficulty, num_questions)

def evaluate_answer(question, user_answer, target_company, difficulty):
    """
    Evaluate user's answer to a LeetCode question using Gemini API
    """
    
    prompt = f"""
You are a senior software engineer evaluating a coding interview answer.

Question: {question}
User's Answer: {user_answer}
Target Company: {target_company}
Difficulty Level: {difficulty}

Evaluate the answer and provide detailed feedback. Return ONLY a valid JSON object with this structure:

{{
    "feedback": "Detailed feedback on the solution approach, code quality, and correctness",
    "score": 100,
    "suggestions": [
        "Consider using a hash map for O(1) lookups",
        "Add edge case handling for empty input",
        "Optimize the time complexity from O(n²) to O(n)"
    ],
    "time_complexity": "O(n)",
    "space_complexity": "O(1)"
}}

Scoring rules:
- Score is out of 100.
- Only give a score of 100 if the solution is fully correct, optimal, well-explained, and handles all edge cases.
- Deduct up to 40 points for correctness issues (wrong or incomplete solution).
- Deduct up to 30 points for efficiency issues (suboptimal time/space complexity).
- Deduct up to 20 points for code quality issues (poor readability, bad structure).
- Deduct up to 10 points for missing edge cases.
- If the solution is perfect, give 100. If there are minor issues, deduct points as specified above. Be specific and consistent.
- Do not give arbitrary scores like 85.5 for a perfect solution.

Evaluation criteria:
- Correctness (40%): Does the solution solve the problem correctly?
- Efficiency (30%): Is the time/space complexity optimal?
- Code Quality (20%): Is the code readable and well-structured?
- Edge Cases (10%): Does it handle edge cases properly?

Score should be 0-100. Be constructive and specific.
"""
    
    try:
        response = client.models.generate_content(
            model="gemini-2.0-flash-exp",
            config=types.GenerateContentConfig(
                temperature=0.2,
                max_output_tokens=2000
            ),
            contents=prompt
        )
        
        feedback_text = response.text.strip()
        
        # Clean up the response
        if feedback_text.startswith('```json'):
            feedback_text = feedback_text[7:-3]
        elif feedback_text.startswith('```'):
            feedback_text = feedback_text[3:-3]
        
        try:
            feedback_data = json.loads(feedback_text)
        except json.JSONDecodeError as json_err:
            logging.error(f"Gemini returned invalid JSON: {json_err} | Partial response: {feedback_text[:500]}")
            return {
                "feedback": "Unable to evaluate answer due to invalid response from AI. Please try again.",
                "score": 0.0,
                "suggestions": ["Please provide a more detailed solution"],
                "time_complexity": "Unknown",
                "space_complexity": "Unknown"
            }
        
        return feedback_data
        
    except Exception as e:
        logging.error(f"Error evaluating answer: {e}")
        return {
            "feedback": "Unable to evaluate answer. Please try again.",
            "score": 0.0,
            "suggestions": ["Please provide a more detailed solution"],
            "time_complexity": "Unknown",
            "space_complexity": "Unknown"
        }

def get_fallback_questions(difficulty, num_questions):
    """
    Fallback questions if Gemini generation fails. Randomly select from a pool for each difficulty.
    """
    fallback_questions = {
        "easy": [
            {
                "id": "fallback_easy_1",
                "title": "Find Maximum in Array",
                "description": "Given an array of integers, return the maximum value.",
                "difficulty": "easy",
                "category": "arrays",
                "hints": ["Iterate through the array and keep track of the max value."],
                "expected_approach": "Linear scan to find the max.",
                "time_complexity": "O(n)",
                "space_complexity": "O(1)"
            },
            {
                "id": "fallback_easy_2",
                "title": "Reverse a String",
                "description": "Given a string, return the string reversed.",
                "difficulty": "easy",
                "category": "strings",
                "hints": ["Use two pointers or Python slicing."],
                "expected_approach": "Swap characters from both ends moving towards the center.",
                "time_complexity": "O(n)",
                "space_complexity": "O(1)"
            },
            {
                "id": "fallback_easy_3",
                "title": "Check for Duplicates",
                "description": "Given an array of integers, determine if any value appears at least twice.",
                "difficulty": "easy",
                "category": "arrays",
                "hints": ["Use a set to track seen values."],
                "expected_approach": "Iterate and check membership in a set.",
                "time_complexity": "O(n)",
                "space_complexity": "O(n)"
            },
            {
                "id": "fallback_easy_4",
                "title": "Count Vowels",
                "description": "Given a string, count the number of vowels (a, e, i, o, u) in the string.",
                "difficulty": "easy",
                "category": "strings",
                "hints": ["Iterate through each character and check if it's a vowel."],
                "expected_approach": "Linear scan with vowel checking.",
                "time_complexity": "O(n)",
                "space_complexity": "O(1)"
            },
            {
                "id": "fallback_easy_5",
                "title": "Find Missing Number",
                "description": "Given an array containing n distinct numbers taken from 0, 1, 2, ..., n, find the one that is missing from the array.",
                "difficulty": "easy",
                "category": "arrays",
                "hints": ["Use mathematical formula or XOR operation."],
                "expected_approach": "Sum of first n numbers minus array sum.",
                "time_complexity": "O(n)",
                "space_complexity": "O(1)"
            }
        ],
        "medium": [
            {
                "id": "fallback_medium_1",
                "title": "Group Anagrams",
                "description": "Given an array of strings, group the anagrams together.",
                "difficulty": "medium",
                "category": "hashing",
                "hints": ["Use a hash map with sorted string as key."],
                "expected_approach": "Sort each string and use as a key in a dictionary.",
                "time_complexity": "O(nk \log k)",
                "space_complexity": "O(nk)"
            },
            {
                "id": "fallback_medium_2",
                "title": "Subarray Sum Equals K",
                "description": "Given an array of integers and an integer k, find the total number of continuous subarrays whose sum equals to k.",
                "difficulty": "medium",
                "category": "arrays",
                "hints": ["Use a hash map to store prefix sums."],
                "expected_approach": "Prefix sum and hash map for O(n) solution.",
                "time_complexity": "O(n)",
                "space_complexity": "O(n)"
            },
            {
                "id": "fallback_medium_3",
                "title": "Find Minimum in Rotated Sorted Array",
                "description": "Suppose an array sorted in ascending order is rotated at some pivot. Find the minimum element.",
                "difficulty": "medium",
                "category": "binary_search",
                "hints": ["Use binary search to find the inflection point."],
                "expected_approach": "Binary search for the minimum value.",
                "time_complexity": "O(log n)",
                "space_complexity": "O(1)"
            },
            {
                "id": "fallback_medium_4",
                "title": "Longest Substring Without Repeating Characters",
                "description": "Given a string, find the length of the longest substring without repeating characters.",
                "difficulty": "medium",
                "category": "strings",
                "hints": ["Use sliding window with a set to track characters."],
                "expected_approach": "Sliding window with hash set.",
                "time_complexity": "O(n)",
                "space_complexity": "O(min(m,n))"
            },
            {
                "id": "fallback_medium_5",
                "title": "Container With Most Water",
                "description": "Given n non-negative integers representing the heights of vertical lines, find two lines that together with the x-axis forms a container that would hold the maximum amount of water.",
                "difficulty": "medium",
                "category": "arrays",
                "hints": ["Use two pointers starting from both ends."],
                "expected_approach": "Two pointer approach from ends.",
                "time_complexity": "O(n)",
                "space_complexity": "O(1)"
            }
        ],
        "hard": [
            {
                "id": "fallback_hard_1",
                "title": "Word Ladder",
                "description": "Given two words (beginWord and endWord), and a dictionary's word list, find the length of shortest transformation sequence from beginWord to endWord.",
                "difficulty": "hard",
                "category": "graphs",
                "hints": ["Use BFS for shortest path."],
                "expected_approach": "Breadth-first search from beginWord to endWord.",
                "time_complexity": "O(N^2M)",
                "space_complexity": "O(NM)"
            },
            {
                "id": "fallback_hard_2",
                "title": "Trapping Rain Water",
                "description": "Given n non-negative integers representing an elevation map, compute how much water it can trap after raining.",
                "difficulty": "hard",
                "category": "arrays",
                "hints": ["Use two pointers or a stack."],
                "expected_approach": "Two pointer approach to calculate trapped water.",
                "time_complexity": "O(n)",
                "space_complexity": "O(1)"
            },
            {
                "id": "fallback_hard_3",
                "title": "Longest Consecutive Sequence",
                "description": "Given an unsorted array of integers, find the length of the longest consecutive elements sequence.",
                "difficulty": "hard",
                "category": "arrays",
                "hints": ["Use a set for O(1) lookups."],
                "expected_approach": "Hash set to check for sequence starts and count length.",
                "time_complexity": "O(n)",
                "space_complexity": "O(n)"
            },
            {
                "id": "fallback_hard_4",
                "title": "Sliding Window Maximum",
                "description": "Given an array of integers and an integer k, find the maximum element in each sliding window of size k.",
                "difficulty": "hard",
                "category": "arrays",
                "hints": ["Use a deque to maintain the maximum in the current window."],
                "expected_approach": "Monotonic decreasing deque.",
                "time_complexity": "O(n)",
                "space_complexity": "O(k)"
            },
            {
                "id": "fallback_hard_5",
                "title": "Serialize and Deserialize Binary Tree",
                "description": "Design an algorithm to serialize and deserialize a binary tree.",
                "difficulty": "hard",
                "category": "trees",
                "hints": ["Use preorder traversal with null markers."],
                "expected_approach": "Preorder traversal with null markers.",
                "time_complexity": "O(n)",
                "space_complexity": "O(n)"
            }
        ]
    }
    
    # Randomly select num_questions from the pool for the given difficulty
    pool = fallback_questions.get(difficulty, fallback_questions["easy"])
    return random.sample(pool, min(num_questions, len(pool))) 