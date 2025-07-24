import { useNavigate } from "react-router-dom";
import { GiTalk } from "react-icons/gi";
import { GrPersonalComputer } from "react-icons/gr";
import { FaRobot } from "react-icons/fa";
import { PiBrain } from "react-icons/pi";
import { useEffect } from "react";

const AiInterviewerMain = () => {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center py-16">
      <div className="w-full max-w-3xl bg-app-accent rounded-2xl shadow-lg px-8 py-10 flex flex-col items-center mb-12 border border-app-primary">
        <div className="flex items-center gap-4 mb-2">
          <FaRobot className="text-5xl"/>
          <h1 className="text-4xl font-bold text-app-primary">AI Interviewer</h1>
        </div>
        <p className="text-xl text-app-text text-center font-medium">
          Practice technical and behavioral interviews with instant AI feedback.
        </p>
      </div>

      <div className="w-full max-w-2xl border-t-2 border-app-primary mb-12"></div>

      <div className="flex flex-col md:flex-row gap-8 justify-center">
        <div
          className="bg-white rounded-xl shadow-lg p-8 w-80 border-2 border-app-primary hover:scale-105 transition-transform flex flex-col items-center"
        >
          <GrPersonalComputer className="text-5xl mb-4" />
          <h2 className="text-2xl font-bold text-app-primary mb-2">Technical Interview</h2>
          <p className="text-app-text text-center mb-4">
            Practice coding questions, system design, and algorithmic problems tailored
            to your background and target companies
          </p>
          <button
            className="btn-primary px-6 py-2 rounded-lg font-semibold cursor-pointer"
            onClick={() => navigate("/ai-interviewer/technical")}
          >
            Start Technical Prep
          </button>
        </div>
        <div
          className="bg-white rounded-xl shadow-lg p-8 w-80 border-2 border-app-primary hover:scale-105 transition-transform flex flex-col items-center"
        >
          <GiTalk className="text-5xl mb-4" />
          <h2 className="text-2xl font-bold text-app-primary mb-2">Behavioral Interview</h2>
          <p className="text-app-text text-center mb-4">
            Practice behavioral questions, STAR method responses, and
            situational scenarios with AI feedback
          </p>
          <button
            className="btn-primary px-6 py-2 rounded-lg font-semibold cursor-pointer"
            onClick={() => navigate("/ai-interviewer/behavioral")}
          >
            Start Behavioral Prep
          </button>
        </div>
        <div
          className="bg-white rounded-xl shadow-lg p-8 w-80 border-2 border-app-primary hover:scale-105 transition-transform flex flex-col items-center"
        >
          <PiBrain className="text-5xl mb-4" />
          <h2 className="text-2xl font-bold text-app-primary mb-2">Blind 75 Test</h2>
          <p className="text-app-text text-center mb-4">
            Solve Blind 75 problems by arranging code blocks in the
            correct order and identifying time and space complexities.
          </p>
          <button
            className="btn-primary px-6 py-2 rounded-lg font-semibold cursor-pointer"
            onClick={() => navigate("/ai-interviewer/blind75")}
          >
            Start Behavioral Prep
          </button>
        </div>
      </div>
    </div>
  );
};

export default AiInterviewerMain;