import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { submitQuestionnaire, fetchQuestionnaire } from "../services/questionnaireServices";
import { completeQuestionnaire, fetchQuestionnaireStatus } from "../services/userServices";
import { generateRoadmap } from "../services/roadmapServices";

const initialState = {
  career_goal: "",
  major: "",
  minor: "",
  education_level: "",
  interests: "",
  institution: "",
  target_companies: "",
  skills: "",
  certifications: "",
  projects: "",
  experience: "",
  timeline: "",
  learning_preference: "",
  available_hours_per_week: "",
};

const Questionnaire = ({ onComplete, user }) => {
  const [form, setForm] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");
  const [wasComplete, setWasComplete] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      if (!user) return;
      setFetching(true);
      try {
        const data = await fetchQuestionnaire(user.id);
        setForm({
          ...data,
        major: (data.major || []).join(", "),
        minor: (data.minor || []).join(", "),
        interests: (data.interests || []).join(", "),
        target_companies: (data.target_companies || []).join(", "),
        skills: (data.skills || []).join(", "),
        certifications: (data.certifications || []).join(", "),
        projects: (data.projects || []).join(", "),
        experience: (data.experience || []).join(", ")
        });
      } catch {
        // If not found, keep initialState
      } finally {
        setFetching(false);
      }
    };
    load();
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  useEffect(() => {
    const checkStatus = async () => {
      if (!user) return;
      try {
        const status = await fetchQuestionnaireStatus(user.id);
        setWasComplete(status.completed);
      } catch {
        setWasComplete(false);
      }
    };
    checkStatus();
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const toArray = (str) =>
        str
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);

      await submitQuestionnaire({
        ...form,
        user_id: user.id,
        major: toArray(form.major),
        minor: toArray(form.minor),
        interests: toArray(form.interests),
        target_companies: toArray(form.target_companies),
        skills: toArray(form.skills),
        certifications: toArray(form.certifications),
        projects: toArray(form.projects),
        experience: toArray(form.experience),
      });
      if (!wasComplete) {
        await completeQuestionnaire(user.id);
      }
      onComplete();
      setShowModal(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleModalYes = async () => {
    setShowModal(false);
    await handleGenerateRoadmap();
  };

  const handleModalNo = () => {
    setShowModal(false);
    navigate("/");
    window.scrollTo(0, 0);
  };

  const handleGenerateRoadmap = async () => {
    setGenerating(true);
    setGenError("");
    try {
      await generateRoadmap(user.id);
      navigate("/roadmaps/careergoal-roadmap");
    } catch (err) {
      setGenError(err.message);
    } finally {
      setGenerating(false);
    }
  };

  if (fetching) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="loader-lg"/>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-app-accent text-app-text border border-app-primary
        p-8 rounded-xl shadow-lg w-full max-w-2xl mt-16 mb-16"
      >
        <h2 className="text-2xl font-bold mb-6 text-center text-app-primary">
          Questionnaire
        </h2>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <div>
            <label className="block mb-1 font-medium">Career Goal</label>
            <input
              name="career_goal"
              value={form.career_goal}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-app-primary rounded-lg focus:outline-none bg-app-background text-app-text"
              placeholder="Career Goal - (Ex: Machine Learning Engineer, Financial Analyst)"
              required
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Institution</label>
            <input
              name="institution"
              value={form.institution}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-app-primary rounded-lg focus:outline-none bg-app-background text-app-text"
              placeholder="Institution - (Ex: Villanova University, Local Community College)"
              required
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Major</label>
            <input
              name="major"
              value={form.major}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-app-primary rounded-lg focus:outline-none bg-app-background text-app-text"
              placeholder="Major(s) - (Ex: Computer Science, Statistics, Business)"
              required
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Minor</label>
            <input
              name="minor"
              value={form.minor}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-app-primary rounded-lg focus:outline-none bg-app-background text-app-text"
              placeholder="Minor(s) - (Ex: Mathematics, Economics, Psychology)"
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Education Level</label>
            <input
              name="education_level"
              value={form.education_level}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-app-primary rounded-lg focus:outline-none bg-app-background text-app-text"
              placeholder="Education Level - (Ex: High School Sophomore, College Junior, Graduate)"
              required
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Target Companies</label>
            <input
              name="target_companies"
              value={form.target_companies}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-app-primary rounded-lg focus:outline-none bg-app-background text-app-text"
              placeholder="Target Companies - (Ex: Google, JPMorgan, Johnson & Johnson)"
              required
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Experience</label>
            <input
              name="experience"
              value={form.experience}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-app-primary rounded-lg focus:outline-none bg-app-background text-app-text"
              placeholder="Experience - (Ex: Internship at XYZ, Research Assistant)"
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Projects</label>
            <input
              name="projects"
              value={form.projects}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-app-primary rounded-lg focus:outline-none bg-app-background text-app-text"
              placeholder="Projects - (Ex: Stock Trading Bot, Mobile Fitness Tracker)"
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Skills</label>
            <input
              name="skills"
              value={form.skills}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-app-primary rounded-lg focus:outline-none bg-app-background text-app-text"
              placeholder="Skills - (Ex: Python, Excel, Graphic Design)"
              required
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Certifications</label>
            <input
              name="certifications"
              value={form.certifications}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-app-primary rounded-lg focus:outline-none bg-app-background text-app-text"
              placeholder="Certifications - (Machine Learning Certificate, Entry Certificate in Business)"
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Interests</label>
            <input
              name="interests"
              value={form.interests}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-app-primary rounded-lg focus:outline-none bg-app-background text-app-text"
              placeholder="Interests - (Ex: Sports, Medicine, Business)"
              required
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Learning Preference</label>
            <input
              name="learning_preference"
              value={form.learning_preference}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-app-primary rounded-lg focus:outline-none bg-app-background text-app-text"
              placeholder="Learning Preference - (Ex: Books, Courses, Videos)"
              required
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Timeline</label>
            <input
              name="timeline"
              value={form.timeline}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-app-primary rounded-lg focus:outline-none bg-app-background text-app-text"
              placeholder="Timeline - (Ex: 1 Week, 1 Month, 1 Year)"
              required
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Available Hours Per Week</label>
            <input
              name="available_hours_per_week"
              value={form.available_hours_per_week}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-app-primary rounded-lg focus:outline-none bg-app-background text-app-text"
              placeholder="Available Hours Per Week - (Ex: 1 hour, 3 hours, 5 hours)"
              required
            />
          </div>
          {error && <div className="text-red-600 text-center">{error}</div>}
          <button
            type="submit"
            disabled={loading}
            className="w-full font-semibold py-2 rounded-lg btn mt-4 flex items-center justify-center cursor-pointer"
          >
            {loading && <div className="loader-md mr-2"></div>}
            {loading ? "Saving..." : "Save"}
          </button>
        </form>
      </div>
      {showModal && (
        <>
          {/* Blur overlay */}
          <div className="fixed inset-0 z-40 backdrop-blur-sm pointer-events-auto"></div>
          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="bg-white text-black rounded-xl p-8 shadow-2xl max-w-md w-full border border-app-primary">
              <h3 className="text-xl font-bold mb-4 text-center">Generate Roadmap?</h3>
              <p className="mb-6 text-center">Would you like to generate your personalized roadmap now?</p>
              <div className="flex justify-center gap-4">
                <button
                  onClick={handleModalYes}
                  className="px-6 py-2 rounded-lg btn font-semibold cursor-pointer"
                >
                  Yes
                </button>
                <button
                  onClick={handleModalNo}
                  className="px-6 py-2 rounded-lg btn font-semibold border cursor-pointer"
                >
                  No
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    {generating && (
      <>
        <div className="fixed inset-0 z-40 backdrop-blur-sm pointer-events-auto"></div>
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="bg-white text-black rounded-xl p-8 shadow-2xl max-w-md w-full border border-app-primary flex flex-col items-center">
            <div className="loader-md mb-4"></div>
            <span className="font-semibold text-lg">Generating your roadmap...</span>
            {genError && <div className="text-red-600 mt-4">{genError}</div>}
          </div>
        </div>
      </>
    )}
    </div>
  );
};

export default Questionnaire;