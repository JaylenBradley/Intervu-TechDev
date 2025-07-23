import { useState, useRef, useEffect } from "react";
import { tailorResumeToJobDescription, fetchUserResume, exportTailoredResume } from "../services/resumeServices";
import { useNavigate } from "react-router-dom";

const TailorResume = ({ user }) => {
  const [jobDescription, setJobDescription] = useState("");
  const [tailoredResume, setTailoredResume] = useState("");
  const [currentResume, setCurrentResume] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [exporting, setExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState(null); // "pdf" | "docx" | null
  const jobDescRef = useRef();
  const navigate = useNavigate();

  useEffect(() => {
    const loadResume = async () => {
      if (!user || !user.id) return;
      try {
        const data = await fetchUserResume(user.id); // uses service
        // Try to reconstruct the resume as plain text from parsed_data
        if (data && data.parsed_data) {
          let text = "";
          if (data.parsed_data.contact_info) {
            text += `${data.parsed_data.contact_info.name || ""}\n${data.parsed_data.contact_info.email || ""}\n${data.parsed_data.contact_info.phone || ""}\n\n`;
          }
          if (data.parsed_data.education && data.parsed_data.education.length) {
            text += "EDUCATION\n";
            data.parsed_data.education.forEach(edu => {
              text += `${edu.degree} at ${edu.institution} (${edu.start_date} - ${edu.end_date})\n`;
            });
            text += "\n";
          }
          if (data.parsed_data.experience && data.parsed_data.experience.length) {
            text += "EXPERIENCE\n";
            data.parsed_data.experience.forEach(exp => {
              text += `${exp.title} at ${exp.company} (${exp.start_date} - ${exp.end_date})\n${exp.description}\n`;
            });
            text += "\n";
          }
          if (data.parsed_data.skills && data.parsed_data.skills.length) {
            text += `SKILLS\n${data.parsed_data.skills.join(", ")}\n\n`;
          }
          if (data.parsed_data.certifications && data.parsed_data.certifications.length) {
            text += `CERTIFICATIONS\n${data.parsed_data.certifications.join(", ")}\n\n`;
          }
          if (data.parsed_data.projects && data.parsed_data.projects.length) {
            text += "PROJECTS\n";
            data.parsed_data.projects.forEach(proj => {
              text += `${proj.name}: ${proj.description}\n`;
            });
            text += "\n";
          }
          setCurrentResume(text.trim());
        } else {
          setCurrentResume("");
        }
      } catch {
        setCurrentResume("");
      }
    };
    loadResume();
  }, [user]);

  const handleTailorResume = async () => {
    setLoading(true);
    setError("");
    setTailoredResume("");
    try {
      const data = await tailorResumeToJobDescription(user.id, jobDescription); // uses service
      setTailoredResume(data.tailored_resume);
    } catch (err) {
      setError("Error tailoring resume. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format) => {
    setExporting(true);
    setExportFormat(format);
    try {
      const blob = await exportTailoredResume(user.id, format);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `tailored_resume.${format === "pdf" ? "pdf" : "docx"}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError("Error exporting file. Please try again.");
    } finally {
      setExporting(false);
      setExportFormat(null);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center py-16">
      <div className="w-full max-w-2xl flex flex-col items-center">
        <button
          onClick={() => navigate("/resume")}
          className="mb-6 bg-white text-app-primary px-6 py-3 text-lg rounded-xl border-2 border-app-primary hover:bg-app-primary hover:text-white transition-colors shadow font-semibold"
        >
          ← Back
        </button>
        {/* Input Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-10 w-full flex flex-col items-center border-2 border-app-primary mb-8">
          <h1 className="text-3xl font-extrabold text-app-primary mb-4">Tailor Resume to Job Description</h1>
          <p className="text-lg text-app-text text-center mb-8">
            Paste the job description below. The tailored resume will only use information from your resume and the job description.
          </p>
          <textarea
            ref={jobDescRef}
            className="w-full h-32 border-2 border-app-primary rounded-xl p-3 text-base mb-6"
            placeholder="Paste job description here..."
            value={jobDescription}
            onChange={e => setJobDescription(e.target.value)}
          />
          <button
            onClick={handleTailorResume}
            disabled={loading || !jobDescription}
            className="bg-app-primary text-white px-8 py-3 text-lg rounded-xl mb-6 hover:bg-app-primary/90 transition-colors font-semibold flex items-center justify-center min-w-[200px] min-h-[56px]"
          >
            {loading ? <div className="loader-md" /> : "Generate Tailored Resume"}
          </button>
          {error && (
            <div className="mb-6 text-red-600 font-bold text-lg">{error}</div>
          )}
        </div>
      </div>
      {/* Comparison Card */}
      {tailoredResume && (
        <div className="w-full max-w-6xl bg-white rounded-2xl shadow-2xl p-8 flex flex-col items-center border-2 border-app-primary">
          <div className="w-full flex flex-row justify-center gap-8">
            <div className="flex-1 min-w-[320px] max-w-[520px] flex flex-col">
              <span className="font-bold text-app-primary mb-2">Current Resume</span>
              <pre className="w-full h-96 text-base font-mono bg-gray-50 rounded-xl border border-app-accent p-4 whitespace-pre-wrap overflow-auto">{currentResume}</pre>
            </div>
            <div className="flex-1 min-w-[320px] max-w-[520px] flex flex-col">
              <span className="font-bold text-app-primary mb-2">Tailored Resume</span>
              <pre className="w-full h-96 text-base font-mono bg-gray-50 rounded-xl border border-app-accent p-4 whitespace-pre-wrap overflow-auto">{tailoredResume}</pre>
              <div className="flex gap-4 mt-4 justify-center w-full">
                <button
                  onClick={() => handleExport("pdf")}
                  disabled={exporting}
                  className="bg-app-primary text-white px-6 py-2 rounded-lg font-semibold hover:bg-app-primary/90 transition-colors flex items-center justify-center min-w-[160px] min-h-[44px]"
                >
                  {exporting && exportFormat === "pdf" ? <div className="loader-md" /> : "Export as PDF"}
                </button>
                <button
                  onClick={() => handleExport("docx")}
                  disabled={exporting}
                  className="bg-app-primary text-white px-6 py-2 rounded-lg font-semibold hover:bg-app-primary/90 transition-colors flex items-center justify-center min-w-[160px] min-h-[44px]"
                >
                  {exporting && exportFormat === "docx" ? <div className="loader-md" /> : "Export as Word"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TailorResume; 