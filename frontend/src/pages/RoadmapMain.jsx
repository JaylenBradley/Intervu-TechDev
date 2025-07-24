// frontend/src/pages/RoadmapMain.jsx
import { useNavigate } from "react-router-dom";

const RoadmapMain = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <div className="bg-app-accent text-app-text border border-app-primary p-8 rounded-xl shadow-lg w-full max-w-2xl mt-16 mb-16">
        <h2 className="text-2xl font-bold mb-6 text-center text-app-primary">
          Roadmap Hub
        </h2>
        <div className="flex flex-col gap-4 items-center">
          <button
            className="btn-primary px-6 py-3 rounded-lg font-semibold w-full cursor-pointer"
            onClick={() => navigate("/roadmaps/careergoal-roadmap")}
            // window.scrollTo(0, 0);
          >
            General Roadmap
          </button>
          <button
            className="btn-primary px-6 py-3 rounded-lg font-semibold w-full cursor-pointer"
            onClick={() => navigate("/roadmaps/skillgap-roadmap")}
            // window.scrollTo(0, 0);
          >
            Skill Gap Roadmaps
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoadmapMain;