import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { fetchQuestionnaire } from "../services/questionnaireServices";

const TechnicalInterview = ({ user }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [sessionId, setSessionId] = useState("");
  const [userProfile, setUserProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  
  // Form state for generating questions
  const [formData, setFormData] = useState({
    targetRole: "",
    targetCompany: "",
    difficulty: "medium",
    numQuestions: 3
  });

  // Load user's questionnaire data
  useEffect(() => {
    const loadUserProfile = async () => {
      if (!user || !user.id) return;
      
      try {
        setLoadingProfile(true);
        const questionnaireData = await fetchQuestionnaire(user.id);
        setUserProfile(questionnaireData);
        
        // Pre-fill form with questionnaire data
        setFormData(prev => ({
          ...prev,
          targetRole: questionnaireData.career_goal || "",
          targetCompany: (questionnaireData.target_companies && questionnaireData.target_companies.length > 0) 
            ? questionnaireData.target_companies[0] 
            : ""
        }));
      } catch (err) {
        console.error("Failed to load user profile:", err);
      } finally {
        setLoadingProfile(false);
      }
    };

    loadUserProfile();
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const generateQuestions = async () => {
    if (!user || !user.id) {
      setError("Please sign in to start a technical interview");
      return;
    }

    if (!formData.targetRole || !formData.targetCompany) {
      setError("Please fill in all required fields");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL || "http://localhost:8000"}/api/interview/technical/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: user.id,
          target_role: formData.targetRole,
          target_company: formData.targetCompany,
          difficulty: formData.difficulty,
          num_questions: parseInt(formData.numQuestions)
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate questions");
      }

      const data = await response.json();
      setQuestions(data.questions);
      setSessionId(data.session_id);
      setCurrentQuestionIndex(0);
      setUserAnswer("");
      setFeedback(null);
      setShowFeedback(false);
    } catch (err) {
      setError("Failed to generate questions. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const submitAnswer = async () => {
    if (!userAnswer.trim()) {
      setError("Please provide an answer before submitting");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const currentQuestion = questions[currentQuestionIndex];
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL || "http://localhost:8000"}/api/interview/technical/evaluate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question_id: currentQuestion.id,
          question: currentQuestion.description,
          user_answer: userAnswer,
          target_company: formData.targetCompany,
          difficulty: formData.difficulty
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to evaluate answer");
      }

      const feedbackData = await response.json();
      setFeedback(feedbackData);
      setShowFeedback(true);
    } catch (err) {
      setError("Failed to evaluate answer. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setUserAnswer("");
      setFeedback(null);
      setShowFeedback(false);
    }
  };

  const previousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setUserAnswer("");
      setFeedback(null);
      setShowFeedback(false);
    }
  };

  const getDifficultyColor = (difficulty) => {
    const colors = {
      easy: "text-green-600 bg-green-100",
      medium: "text-yellow-600 bg-yellow-100",
      hard: "text-red-600 bg-red-100"
    };
    return colors[difficulty] || "text-gray-600 bg-gray-100";
  };

  const getScoreColor = (score) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  if (loadingProfile) {
    return (
      <div className="min-h-screen bg-app-background flex flex-col items-center justify-center py-16">
        <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-2xl text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-app-primary mx-auto mb-4"></div>
          <p className="text-app-text">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-app-background flex flex-col items-center justify-center py-16">
        <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-2xl">
          <h1 className="text-3xl font-bold text-app-primary mb-6 text-center">
            Technical Interview Prep
          </h1>
          <p className="text-app-text mb-6 text-center">
            Generate LeetCode questions tailored to your target role and company
          </p>

          {userProfile && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h3 className="font-medium text-blue-800 mb-2">Your Profile Data:</h3>
              <div className="text-sm text-blue-700 space-y-1">
                <p><strong>Career Goal:</strong> {userProfile.career_goal || "Not specified"}</p>
                <p><strong>Target Companies:</strong> {userProfile.target_companies?.join(", ") || "Not specified"}</p>
                <p><strong>Skills:</strong> {userProfile.skills?.join(", ") || "Not specified"}</p>
              </div>
            </div>
          )}

          <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); generateQuestions(); }}>
            <div>
              <label className="block mb-2 font-medium text-app-text">
                Target Role 
                <span className="text-sm text-gray-500 ml-1">(from your questionnaire)</span>
              </label>
              <input
                type="text"
                name="targetRole"
                value={formData.targetRole}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-app-primary rounded-lg focus:outline-none bg-app-background text-app-text"
                placeholder="e.g., Software Engineer, Data Scientist"
                required
              />
            </div>

            <div>
              <label className="block mb-2 font-medium text-app-text">
                Target Company 
                <span className="text-sm text-gray-500 ml-1">(from your questionnaire)</span>
              </label>
              {userProfile?.target_companies && userProfile.target_companies.length > 1 ? (
                <select
                  name="targetCompany"
                  value={formData.targetCompany}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-app-primary rounded-lg focus:outline-none bg-app-background text-app-text"
                  required
                >
                  <option value="">Select a company</option>
                  {userProfile.target_companies.map((company, index) => (
                    <option key={index} value={company.trim()}>
                      {company.trim()}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  name="targetCompany"
                  value={formData.targetCompany}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-app-primary rounded-lg focus:outline-none bg-app-background text-app-text"
                  placeholder="e.g., Google, Amazon, Microsoft"
                  required
                />
              )}
            </div>

            <div>
              <label className="block mb-2 font-medium text-app-text">Difficulty Level</label>
              <select
                name="difficulty"
                value={formData.difficulty}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-app-primary rounded-lg focus:outline-none bg-app-background text-app-text"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>

            <div>
              <label className="block mb-2 font-medium text-app-text">Number of Questions</label>
              <select
                name="numQuestions"
                value={formData.numQuestions}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-app-primary rounded-lg focus:outline-none bg-app-background text-app-text"
              >
                <option value={3}>3 Questions</option>
                <option value={5}>5 Questions</option>
                <option value={10}>10 Questions</option>
              </select>
            </div>

            {error && (
              <div className="text-red-600 text-sm">{error}</div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-app-primary text-white py-3 px-6 rounded-lg font-semibold hover:bg-opacity-90 transition-colors disabled:opacity-50"
            >
              {loading ? "Generating Questions..." : "Generate Questions"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="min-h-screen bg-app-background py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold text-app-primary">
              Technical Interview
            </h1>
            <div className="text-sm text-app-text">
              Question {currentQuestionIndex + 1} of {questions.length}
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mb-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-app-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Question {currentQuestionIndex + 1}</span>
              <span>{Math.round(((currentQuestionIndex + 1) / questions.length) * 100)}% Complete</span>
            </div>
          </div>
          
          <div className="flex gap-4 text-sm">
            <span className="text-app-text">Role: {formData.targetRole}</span>
            <span className="text-app-text">Company: {formData.targetCompany}</span>
            <span className={`px-2 py-1 rounded ${getDifficultyColor(formData.difficulty)}`}>
              {formData.difficulty.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Question */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-app-primary">
                {currentQuestion.title}
              </h2>
            </div>
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(currentQuestion.difficulty)}`}>
                {currentQuestion.difficulty}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={previousQuestion}
                  disabled={currentQuestionIndex === 0}
                  className="px-3 py-1 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ← Previous
                </button>
                <button
                  onClick={nextQuestion}
                  disabled={currentQuestionIndex === questions.length - 1}
                  className="px-3 py-1 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next →
                </button>
              </div>
            </div>
          </div>
          
          <div className="mb-4">
            <h3 className="font-medium text-app-text mb-2">Problem Description:</h3>
            <div className="bg-gray-50 p-4 rounded-lg text-app-text whitespace-pre-wrap">
              {currentQuestion.description}
            </div>
          </div>

          <div className="mb-4">
            <h3 className="font-medium text-app-text mb-2">Category:</h3>
            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
              {currentQuestion.category.replace('_', ' ')}
            </span>
          </div>

          <div className="mb-4">
            <h3 className="font-medium text-app-text mb-2">Hints:</h3>
            <ul className="list-disc list-inside text-app-text space-y-1">
              {currentQuestion.hints.map((hint, index) => (
                <li key={index}>{hint}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Answer Input */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h3 className="font-medium text-app-text mb-4">Your Solution:</h3>
          <textarea
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            placeholder="Write your solution here... Include your approach, code, and reasoning."
            className="w-full h-48 px-3 py-2 border border-app-primary rounded-lg focus:outline-none bg-app-background text-app-text resize-none"
          />
          
          <div className="flex gap-4 mt-4">
            <button
              onClick={submitAnswer}
              disabled={loading || !userAnswer.trim()}
              className="bg-app-primary text-white py-2 px-6 rounded-lg font-semibold hover:bg-opacity-90 transition-colors disabled:opacity-50"
            >
              {loading ? "Evaluating..." : "Submit Answer"}
            </button>
            
            {showFeedback && (
              <>
                {currentQuestionIndex > 0 && (
                  <button
                    onClick={previousQuestion}
                    className="bg-gray-400 text-white py-2 px-6 rounded-lg font-semibold hover:bg-opacity-90 transition-colors"
                  >
                    ← Previous Question
                  </button>
                )}
                {currentQuestionIndex < questions.length - 1 && (
                  <button
                    onClick={nextQuestion}
                    className="bg-gray-500 text-white py-2 px-6 rounded-lg font-semibold hover:bg-opacity-90 transition-colors"
                  >
                    Next Question →
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Feedback */}
        {showFeedback && feedback && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <h3 className="font-medium text-app-text mb-4">Feedback:</h3>
            
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-medium text-app-text">Score:</span>
                <span className={`text-2xl font-bold ${getScoreColor(feedback.score)}`}>
                  {feedback.score.toFixed(1)}/100
                </span>
              </div>
            </div>

            <div className="mb-4">
              <h4 className="font-medium text-app-text mb-2">Detailed Feedback:</h4>
              <div className="bg-gray-50 p-4 rounded-lg text-app-text whitespace-pre-wrap">
                {feedback.feedback}
              </div>
            </div>

            <div className="mb-4">
              <h4 className="font-medium text-app-text mb-2">Suggestions:</h4>
              <ul className="list-disc list-inside text-app-text space-y-1">
                {feedback.suggestions.map((suggestion, index) => (
                  <li key={index}>{suggestion}</li>
                ))}
              </ul>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-app-text mb-1">Time Complexity:</h4>
                <span className="text-sm text-app-text">{feedback.time_complexity}</span>
              </div>
              <div>
                <h4 className="font-medium text-app-text mb-1">Space Complexity:</h4>
                <span className="text-sm text-app-text">{feedback.space_complexity}</span>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default TechnicalInterview; 