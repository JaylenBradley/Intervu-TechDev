import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { GiSkills } from "react-icons/gi";
import { MdWork } from "react-icons/md";

const RoadmapMain = () => {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center">
      <div className="w-full max-w-4xl mt-20 mb-20">

        <div className="bg-white rounded-2xl shadow-2xl p-10 mb-12 flex flex-col items-center border border-app-primary">
          <h1 className="text-4xl font-extrabold text-app-primary mb-2 text-center tracking-tight">
            Welcome to Your Roadmap Hub
          </h1>
          <p className="text-lg text-gray-600 mb-4 text-center max-w-2xl">
            Visualize your career journey and close your skill gaps with professional, actionable roadmaps. Select a roadmap type to get started
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-stretch">
          <div className="card bg-white rounded-xl shadow-lg p-8 flex flex-col items-center border-2 border-app-primary hover:shadow-2xl transition-all h-full justify-between">
            <MdWork className="text-6xl mb-4"/>
            <h3 className="text-2xl font-bold text-app-primary mb-2">Career Goal Roadmap</h3>
            <p className="text-gray-600 mb-6 text-center">
              Get a personalized, step-by-step plan to reach your career goals based on your questionnaire
            </p>
            <button
              className="btn-primary px-6 py-3 rounded-lg font-semibold w-full cursor-pointer text-lg mt-auto"
              onClick={() => navigate("/roadmaps/career-goal-roadmap")}
            >
              View Career Goal Roadmap
            </button>
          </div>
          <div className="card bg-white rounded-xl shadow-lg p-8 flex flex-col items-center border-2 border-app-primary hover:shadow-2xl transition-all h-full justify-between">
            <GiSkills className="text-6xl mb-4"/>
            <h3 className="text-2xl font-bold text-app-primary mb-2">Skill Gap Roadmaps</h3>
            <p className="text-gray-600 mb-6 text-center">
              Generate targeted roadmaps to bridge the gap between your current skills and specific job descriptions
            </p>
            <button
              className="btn-primary px-6 py-3 rounded-lg font-semibold w-full cursor-pointer text-lg mt-auto"
              onClick={() => navigate("/roadmaps/skill-gap-roadmap")}
            >
              View Skill Gap Roadmaps
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoadmapMain;