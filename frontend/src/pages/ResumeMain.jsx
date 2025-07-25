import { FaFileAlt, FaSearch } from "react-icons/fa";
import { FaFilePen } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { fetchUserResume } from "../services/resumeServices";
import { tailorResumeToJobDescription } from "../services/resumeServices";
import { useRef } from "react";

const getBullets = (desc) => {
  if (!desc) return [];
  let bullets = desc
    .split(/\r?\n/)
    .map(line => line.replace(/^[-•▪\s]+/, '').trim())
    .filter(Boolean);

  if (bullets.length <= 1) {
    // Try splitting on period+space, period+capital, or space+common action verb
    bullets = desc
      .split(/\. (?=[A-Z])|\.(?=[A-Z])| (?=Led |Implemented |Designed |Built |Created |Developed |Managed |Coordinated |Organized |Produced |Launched |Founded |Started |Initiated |Oversaw |Directed |Supervised |Enhanced |Improved |Increased |Reduced |Streamlined |Automated |Analyzed |Researched |Presented |Taught |Mentored |Tutored |Assisted |Supported |Collaborated )/g)
      .map(line => line.replace(/^[-•▪\s]+/, '').trim())
      .filter(Boolean);
  }
  return bullets;
};

const ResumeMain = ({ user }) => {
  const navigate = useNavigate();
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [improvedResume, setImprovedResume] = useState("");
  const [improving, setImproving] = useState(false);
  const [improveError, setImproveError] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [tailoredResume, setTailoredResume] = useState("");
  const [tailorLoading, setTailorLoading] = useState(false);
  const [tailorError, setTailorError] = useState("");
  const [showTailor, setShowTailor] = useState(false);
  const jobDescRef = useRef();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const loadResume = async () => {
      if (!user || !user.id) return;
      setLoading(true);
      try {
        const data = await fetchUserResume(user.id);
        setResume(data);
      } catch {
        setResume(null);
      } finally {
        setLoading(false);
      }
    };
    loadResume();
  }, [user]);

  const handleImproveResume = async () => {
    setImproving(true);
    setImproveError("");
    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL || "http://localhost:8000"}/api/resume/improve?user_id=${user.id}`
      );
      if (!res.ok) throw new Error("Failed to improve resume");
      const data = await res.json();
      setImprovedResume(data.improved_resume);
    } catch (err) {
      setImproveError("Error improving resume. Please try again.");
    } finally {
      setImproving(false);
    }
  };

  const handleTailorResume = async () => {
    setTailorLoading(true);
    setTailorError("");
    setTailoredResume("");
    try {
      const data = await tailorResumeToJobDescription(user.id, jobDescription);
      setTailoredResume(data.tailored_resume);
    } catch (err) {
      setTailorError("Error tailoring resume. Please try again.");
    } finally {
      setTailorLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loader-lg" />
      </div>
    );
  }

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

      {/* Display current resume */}
      {resume && (
        <div className="w-full max-w-3xl mb-8 flex flex-col items-center">
          <div className="w-full bg-white border-2 border-app-primary rounded-xl shadow p-6 mb-4">
            <h2 className="text-xl font-bold text-app-primary mb-2">Current Resume</h2>
            <div className="mb-2"><strong>File Name:</strong> {resume.file_name}</div>
            <div className="mb-4">
              <strong>Contact Info:</strong><br/>
              Name: {resume.parsed_data.contact_info?.name}<br/>
              Email: {resume.parsed_data.contact_info?.email}<br/>
              Phone: {resume.parsed_data.contact_info?.phone}
            </div>
            <div className="mb-4">
              <strong>Education:</strong>
              <ul className="list-disc ml-6">
                {resume.parsed_data.education.map((edu, i) => (
                  <li key={i}>
                    <strong>{edu.degree}</strong> at {edu.institution} ({edu.start_date} - {edu.end_date})
                  </li>
                ))}
              </ul>
            </div>
            <div className="mb-4">
              <strong>Experience:</strong>
              <ul className="list-disc ml-6">
                {resume.parsed_data.experience.map((exp, i) => (
                  <li key={i}>
                    <strong>{exp.title}</strong> at {exp.company} ({exp.start_date} - {exp.end_date})<br/>
                    {exp.description && (
                      <ul className="list-disc ml-6">
                        {getBullets(exp.description).map((line, j) => (
                          <li key={j}>{line}</li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
              </ul>
            </div>
            {resume.parsed_data.leadership && resume.parsed_data.leadership.length > 0 && (
              <div className="mb-4">
                <strong>Leadership:</strong>
                <ul className="list-disc ml-6">
                  {resume.parsed_data.leadership.map((lead, i) => (
                    <li key={i}>
                      <strong>{lead.title}</strong> at {lead.organization} ({lead.start_date} - {lead.end_date})<br/>
                      {lead.description && (
                        <ul className="list-disc ml-6">
                          {getBullets(lead.description).map((line, j) => (
                            <li key={j}>{line}</li>
                          ))}
                        </ul>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {resume.parsed_data.skills && resume.parsed_data.skills.length > 0 && (
              <div className="mb-4">
                <strong>Skills:</strong> {resume.parsed_data.skills.join(", ")}
              </div>
            )}
            {resume.parsed_data.certifications && resume.parsed_data.certifications.length > 0 && (
              <div className="mb-4">
                <strong>Certifications:</strong> {resume.parsed_data.certifications.join(", ")}
              </div>
            )}
            {resume.parsed_data.projects && resume.parsed_data.projects.length > 0 && (
              <div className="mb-4">
                <strong>Projects:</strong>
                <ul className="list-disc ml-6">
                  {resume.parsed_data.projects.map((proj, i) => (
                    <li key={i}>
                      <strong>{proj.name}</strong>: {proj.description && (
                        <ul className="list-disc ml-6">
                          {getBullets(proj.description).map((line, j) => (
                            <li key={j}>{line}</li>
                          ))}
                        </ul>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          <button
            className="btn-primary px-6 py-2 rounded-lg font-semibold cursor-pointer mb-2"
            onClick={() => navigate("/resume/change")}
          >
            Change Resume
          </button>
        </div>
      )}

      <div className="w-full max-w-2xl border-t-2 border-app-primary mb-12"></div>

      <div className="flex flex-col md:flex-row gap-8 justify-center">
        {/* Build Resume Card */}
        <div className="bg-white rounded-xl shadow-lg p-8 w-80 border-2 border-app-primary hover:scale-105 transition-transform flex flex-col items-center">
          <FaFilePen className="text-5xl mb-4" />
          <h2 className="text-2xl font-bold text-app-primary mb-2">Build Resume</h2>
          <p className="text-app-text text-center mb-4">
            Improve your uploaded resume with AI-powered suggestions and formatting.
          </p>
          <button className="btn-primary px-6 py-2 rounded-lg font-semibold cursor-pointer" onClick={() => navigate("/resume/improve")}>Improve Resume</button>
          {improveError && <div className="text-red-600 mt-2">{improveError}</div>}
          {improvedResume && (
            <textarea className="w-full h-72 border-2 border-app-primary rounded-xl p-5 mt-4 text-lg" value={improvedResume} readOnly />
          )}
        </div>
        {/* Analyze Resume Card */}
        <div className="bg-white rounded-xl shadow-lg p-8 w-80 border-2 border-app-primary hover:scale-105 transition-transform flex flex-col items-center">
          <FaSearch className="text-5xl mb-4" />
          <h2 className="text-2xl font-bold text-app-primary mb-2">Analyze Resume</h2>
          <p className="text-app-text text-center mb-4">
            Get instant feedback and optimization tips for your uploaded resume
          </p>
          <button className="btn-primary px-6 py-2 rounded-lg font-semibold cursor-pointer" onClick={() => navigate("/resume/feedback")}>Analyze Resume</button>
        </div>
        {/* Tailor Resume Card */}
        <div className="bg-white rounded-xl shadow-lg p-8 w-80 border-2 border-app-primary hover:scale-105 transition-transform flex flex-col items-center">
          <FaFilePen className="text-5xl mb-4 rotate-45" />
          <h2 className="text-2xl font-bold text-app-primary mb-2">Tailor Resume</h2>
          <p className="text-app-text text-center mb-4">
            Input a job description and get a version of your resume tailored for that role.
          </p>
          <button className="btn-primary px-6 py-2 rounded-lg font-semibold cursor-pointer mb-2" onClick={() => navigate("/resume/tailor")}>Tailor Resume</button>
        </div>
      </div>
    </div>
  );
};

export default ResumeMain;