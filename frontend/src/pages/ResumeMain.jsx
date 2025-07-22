import { FaFileAlt, FaSearch } from "react-icons/fa";
import { FaFilePen } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";

const ResumeMain = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center py-16">
      <div className="w-full max-w-3xl bg-app-accent rounded-2xl shadow-lg px-8 py-10 flex flex-col items-center mb-12 border border-app-primary">
        <div className="flex items-center gap-4 mb-2">
          <FaFileAlt className="text-5xl"/>
          <h1 className="text-4xl font-bold text-app-primary">Resume Center</h1>
        </div>
        <p className="text-xl text-app-text text-center font-medium">
          Build, analyze, and optimize your resume for your target roles and companies.
        </p>
      </div>

      <div className="w-full max-w-2xl border-t-2 border-app-primary mb-12"></div>

      <div className="flex flex-col md:flex-row gap-8 justify-center">
        <div
          className="bg-white rounded-xl shadow-lg p-8 w-80 border-2 border-app-primary
          hover:scale-105 transition-transform flex flex-col items-center"
        >
          <FaFilePen className="text-5xl mb-4" />
          <h2 className="text-2xl font-bold text-app-primary mb-2">Build Resume</h2>
          <p className="text-app-text text-center mb-4">
            Create a professional resume tailored to your career goals and target companies
          </p>
          <button
            className="btn-primary px-6 py-2 rounded-lg font-semibold cursor-pointer"
            onClick={() => navigate("/resume/improve")}
          >
            Start Building
          </button>
        </div>
        <div
          className="bg-white rounded-xl shadow-lg p-8 w-80 border-2 border-app-primary
          hover:scale-105 transition-transform flex flex-col items-center"
        >
          <FaSearch className="text-5xl mb-4" />
          <h2 className="text-2xl font-bold text-app-primary mb-2">Analyze Resume</h2>
          <p className="text-app-text text-center mb-4">
            Get instant feedback and optimization tips for your uploaded resume
          </p>
          <button
            className="btn-primary px-6 py-2 rounded-lg font-semibold cursor-pointer"
            onClick={() => navigate("/resume/feedback")}
          >
            Analyze Resume
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResumeMain;