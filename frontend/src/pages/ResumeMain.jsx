import React from "react";
import { useNavigate } from "react-router-dom";

const ResumeMain = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center py-16">
      <h1 className="text-4xl font-bold text-app-primary mb-8">Resume Tools</h1>
      <div className="flex flex-col md:flex-row gap-8">
        {/* Left Card: Create a Resume */}
        <div
          className="bg-white rounded-xl shadow-lg p-8 w-80 cursor-pointer border-2 border-app-primary hover:scale-105 transition-transform flex flex-col items-center"
          onClick={() => navigate("/resume/create")}
        >
          <div className="text-6xl mb-4">📝</div>
          <h2 className="text-2xl font-semibold text-app-primary mb-2">Create a Resume</h2>
          <p className="text-app-text text-center">Upload your resume or start from scratch, enhance it with AI, and export as Word or PDF.</p>
        </div>
        {/* Right Card: Get Feedback */}
        <div
          className="bg-white rounded-xl shadow-lg p-8 w-80 cursor-pointer border-2 border-app-primary hover:scale-105 transition-transform flex flex-col items-center"
          onClick={() => navigate("/resume/feedback")}
        >
          <div className="text-6xl mb-4">🔍</div>
          <h2 className="text-2xl font-semibold text-app-primary mb-2">Get Feedback</h2>
          <p className="text-app-text text-center">Upload your resume and get detailed, bullet-by-bullet feedback to improve your impact.</p>
        </div>
      </div>
    </div>
  );
};

export default ResumeMain; 