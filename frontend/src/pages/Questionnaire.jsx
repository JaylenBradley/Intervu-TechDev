import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { submitQuestionnaire, fetchQuestionnaire } from "../services/questionnaireServices";
import { completeQuestionnaire, fetchQuestionnaireStatus } from "../services/userServices";

const initialState = {
  career_goal: "",
  major: "",
  education_level: "",
  passions: [],
  institution: "",
  target_companies: [],
  skills: [],
  certifications: [],
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
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      if (!user) return;
      setFetching(true);
      try {
        const data = await fetchQuestionnaire(user.id);
        setForm({
          ...data,
          passions: data.passions || [],
          target_companies: data.target_companies || [],
          skills: data.skills || [],
          certifications: data.certifications || [],
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

  const handleArrayChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value.split(",").map((s) => s.trim()).filter(Boolean),
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
      await submitQuestionnaire({ ...form, user_id: user.id });
      if (!wasComplete) {
        await completeQuestionnaire(user.id);
      }
      onComplete();
      navigate("/");
      window.scrollTo(0, 0);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div>Loading questionnaire...</div>;

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-app-accent text-app-text border border-app-primary
      p-8 rounded-xl shadow-lg w-full max-w-2xl mt-16 mb-16">
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
              placeholder="Career Goal"
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
              placeholder="Major"
              required
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Education Level</label>
            <input
              name="education_level"
              value={form.education_level}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-app-primary rounded-lg focus:outline-none bg-app-background text-app-text"
              placeholder="Education Level"
              required
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Passions</label>
            <input
              name="passions"
              value={form.passions.join(", ")}
              onChange={handleArrayChange}
              className="w-full px-3 py-2 border border-app-primary rounded-lg focus:outline-none bg-app-background text-app-text"
              placeholder="Passions (comma separated)"
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
              placeholder="Institution"
              required
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Target Companies</label>
            <input
              name="target_companies"
              value={form.target_companies.join(", ")}
              onChange={handleArrayChange}
              className="w-full px-3 py-2 border border-app-primary rounded-lg focus:outline-none bg-app-background text-app-text"
              placeholder="Target Companies (comma separated)"
              required
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Skills</label>
            <input
              name="skills"
              value={form.skills.join(", ")}
              onChange={handleArrayChange}
              className="w-full px-3 py-2 border border-app-primary rounded-lg focus:outline-none bg-app-background text-app-text"
              placeholder="Skills (comma separated)"
              required
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Certifications</label>
            <input
              name="certifications"
              value={form.certifications.join(", ")}
              onChange={handleArrayChange}
              className="w-full px-3 py-2 border border-app-primary rounded-lg focus:outline-none bg-app-background text-app-text"
              placeholder="Certifications (comma separated)"
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Projects</label>
            <input
              name="projects"
              value={form.projects}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-app-primary rounded-lg focus:outline-none bg-app-background text-app-text"
              placeholder="Projects"
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Experience</label>
            <input
              name="experience"
              value={form.experience}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-app-primary rounded-lg focus:outline-none bg-app-background text-app-text"
              placeholder="Experience"
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Timeline</label>
            <input
              name="timeline"
              value={form.timeline}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-app-primary rounded-lg focus:outline-none bg-app-background text-app-text"
              placeholder="Timeline (Ex: 1 month, 1 year, ...)"
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
              placeholder="Learning Preference (Ex: books, courses, videos, ...)"
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
              placeholder="Available Hours Per Week"
              required
            />
          </div>
          {error && <div className="text-red-600 text-center">{error}</div>}
          <button
            type="submit"
            disabled={loading}
            className="w-full font-semibold py-2 rounded-lg btn mt-4"
          >
            {loading ? "Saving..." : "Save"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Questionnaire;