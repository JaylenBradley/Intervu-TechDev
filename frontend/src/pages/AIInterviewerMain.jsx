import React from "react";
import { useNavigate } from "react-router-dom";

const AIInterviewerMain = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-app-background flex flex-col items-center justify-center py-16">
      <h1 className="text-4xl font-bold text-app-primary mb-8">AI Interviewer</h1>
      <div className="flex flex-col md:flex-row gap-8">
        {/* Left Card: Technical Interview */}
        <div
          className="bg-white rounded-xl shadow-lg p-8 w-80 cursor-pointer border-2 border-app-primary hover:scale-105 transition-transform flex flex-col items-center"
          onClick={() => navigate("/ai-interviewer/technical")}
        >
          <div className="text-6xl mb-4">💻</div>
          <h2 className="text-2xl font-semibold text-app-primary mb-2">Technical Interview</h2>
          <p className="text-app-text text-center">Practice coding questions, system design, and algorithmic problems tailored to your background and target companies.</p>
        </div>
        {/* Right Card: Behavioral Interview */}
        <div
          className="bg-white rounded-xl shadow-lg p-8 w-80 cursor-pointer border-2 border-app-primary hover:scale-105 transition-transform flex flex-col items-center"
          onClick={() => navigate("/ai-interviewer/behavioral")}
        >
          <div className="text-6xl mb-4">🤝</div>
          <h2 className="text-2xl font-semibold text-app-primary mb-2">Behavioral Interview</h2>
          <p className="text-app-text text-center">Practice behavioral questions, STAR method responses, and situational scenarios with AI feedback.</p>
        </div>
      </div>
    </div>
  );
};

export default AIInterviewerMain; 