import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { submitQuestionnaire, fetchQuestionnaire } from "../services/questionnaireServices";

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
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      if (!user) return;
      setFetching(true);
      try {
        const data = await fetchQuestionnaire(user.uid);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await submitQuestionnaire({ ...form, user_id: user.uid });
      onComplete();
      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div>Loading questionnaire...</div>;

  return (
    <form onSubmit={handleSubmit}>
      <h2>Edit Your Questionnaire</h2>
      <input name="career_goal" value={form.career_goal} onChange={handleChange} placeholder="Career Goal" required />
      <input name="major" value={form.major} onChange={handleChange} placeholder="Major" required />
      <input name="education_level" value={form.education_level} onChange={handleChange} placeholder="Education Level" required />
      <input name="passions" value={form.passions.join(", ")} onChange={handleArrayChange} placeholder="Passions (comma separated)" required />
      <input name="institution" value={form.institution} onChange={handleChange} placeholder="Institution" required />
      <input name="target_companies" value={form.target_companies.join(", ")} onChange={handleArrayChange} placeholder="Target Companies (comma separated)" required />
      <input name="skills" value={form.skills.join(", ")} onChange={handleArrayChange} placeholder="Skills (comma separated)" required />
      <input name="certifications" value={form.certifications.join(", ")} onChange={handleArrayChange} placeholder="Certifications (comma separated)" />
      <input name="projects" value={form.projects} onChange={handleChange} placeholder="Projects" />
      <input name="experience" value={form.experience} onChange={handleChange} placeholder="Experience" />
      <input name="timeline" value={form.timeline} onChange={handleChange} placeholder="Timeline" required />
      <input name="learning_preference" value={form.learning_preference} onChange={handleChange} placeholder="Learning Preference" required />
      <input name="available_hours_per_week" value={form.available_hours_per_week} onChange={handleChange} placeholder="Available Hours Per Week" required />
      {error && <div style={{ color: "red" }}>{error}</div>}
      <button type="submit" disabled={loading}>{loading ? "Saving..." : "Save"}</button>
    </form>
  );
};

export default Questionnaire;