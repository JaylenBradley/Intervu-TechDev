import { useState, useRef, useEffect } from "react";
import { tailorResumeToJobDescription, fetchUserResume, exportTailoredResume } from "../services/resumeServices";
import { useNavigate } from "react-router-dom";

const TailorResume = ({ user }) => {
  const [jobDescription, setJobDescription] = useState("");
  const [tailoredResume, setTailoredResume] = useState("");
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [exporting, setExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState(null); // "pdf" | "docx" | null
  const jobDescRef = useRef();
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const loadResume = async () => {
      if (!user || !user.id) return;
      try {
        const data = await fetchUserResume(user.id);
        setResume(data);
      } catch {
        setResume(null);
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
      // Use the cleaned tailored data for export instead of raw JSON
      const exportData = tailoredParsed ? JSON.stringify(tailoredParsed) : tailoredResume;
      const blob = await exportTailoredResume(user.id, format, exportData);
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

  // Add getBullets function from ResumeMain
  const getBullets = (desc) => {
    if (!desc) return [];
    
    // If it's already an array, return it directly
    if (Array.isArray(desc)) {
      return desc.filter(item => item && item.trim()); // Filter out empty items
    }
    
    // If it's a string, parse it as before
    if (typeof desc === 'string') {
      let bullets = desc
        .split(/\r?\n/)
        .map(line => line.replace(/^[-\u2022\u25aa\s]+/, '').trim())
        .filter(Boolean);

      if (bullets.length <= 1) {
        // Try splitting on period+space, period+capital, or space+common action verb
        bullets = desc
          .split(/\. (?=[A-Z])|\.(?=[A-Z])| (?=Led |Implemented |Designed |Built |Created |Developed |Managed |Coordinated |Organized |Produced |Launched |Founded |Started |Initiated |Oversaw |Directed |Supervised |Enhanced |Improved |Increased |Reduced |Streamlined |Automated |Analyzed |Researched |Presented |Taught |Mentored |Tutored |Assisted |Supported |Collaborated )/g)
          .map(line => line.replace(/^[-\u2022\u25aa\s]+/, '').trim())
          .filter(Boolean);
      }
      return bullets;
    }
    
    // If it's neither array nor string, return empty array
    console.warn('getBullets received unexpected data type:', typeof desc, desc);
    return [];
  };

  // Helper to validate and clean tailored resume data
  const cleanTailoredData = (data) => {
    if (!data) return null;
    
    // Clean experience descriptions
    if (data.experience) {
      data.experience.forEach(exp => {
        if (exp.description && Array.isArray(exp.description)) {
          exp.description = exp.description
            .filter(item => item && item.trim())
            .map(item => {
              // Ensure proper sentence termination
              let cleaned = item.trim();
              if (cleaned && !cleaned.endsWith('.') && !cleaned.endsWith('!') && !cleaned.endsWith('?')) {
                cleaned += '.';
              }
              return cleaned;
            });
        }
      });
    }
    
    // Clean leadership descriptions
    if (data.leadership) {
      data.leadership.forEach(lead => {
        if (lead.description && Array.isArray(lead.description)) {
          lead.description = lead.description
            .filter(item => item && item.trim())
            .map(item => {
              let cleaned = item.trim();
              if (cleaned && !cleaned.endsWith('.') && !cleaned.endsWith('!') && !cleaned.endsWith('?')) {
                cleaned += '.';
              }
              return cleaned;
            });
        }
      });
    }
    
    // Clean project descriptions
    if (data.projects) {
      data.projects.forEach(proj => {
        if (proj.description && Array.isArray(proj.description)) {
          proj.description = proj.description
            .filter(item => item && item.trim())
            .map(item => {
              let cleaned = item.trim();
              if (cleaned && !cleaned.endsWith('.') && !cleaned.endsWith('!') && !cleaned.endsWith('?')) {
                cleaned += '.';
              }
              return cleaned;
            });
        }
      });
    }
    
    return data;
  };

  // Helper to parse tailoredResume as JSON
  let tailoredParsed = null;
  try {
    tailoredParsed = tailoredResume ? JSON.parse(tailoredResume) : null;
    if (tailoredParsed) {
      console.log('Tailored resume parsed:', tailoredParsed);
      // Clean and validate the data
      tailoredParsed = cleanTailoredData(tailoredParsed);
      // Debug the structure of experience descriptions
      if (tailoredParsed.experience) {
        tailoredParsed.experience.forEach((exp, i) => {
          console.log(`Experience ${i} description type:`, typeof exp.description, exp.description);
        });
      }
    }
  } catch (e) {
    console.error('Error parsing tailored resume:', e);
    tailoredParsed = null;
  }



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
          <div className="w-full flex flex-row justify-center gap-8 mb-6">
            {/* Current Resume - structured display like ResumeMain */}
            <div className="flex-1 min-w-[320px] max-w-[750px] flex flex-col">
              <span className="font-bold text-app-primary mb-2 text-center">Current Resume</span>
              {resume ? (
                <div className="w-full bg-white border-2 border-app-primary rounded-xl shadow p-6 mb-4">
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
                  {resume.parsed_data.leadership && resume.parsed_data.leadership.length > 0 && (
                    <div className="mb-4">
                      <strong>Leadership & Involvement:</strong>
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
                      <strong>Technical Skills:</strong> {resume.parsed_data.skills.join(", ")}
                    </div>
                  )}
                  {resume.parsed_data.certifications && resume.parsed_data.certifications.length > 0 && (
                    <div className="mb-4">
                      <strong>Certifications:</strong> {resume.parsed_data.certifications.join(", ")}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-gray-500">No resume found.</div>
              )}
            </div>
            {/* Tailored Resume - structured display */}
            <div className="flex-1 min-w-[320px] max-w-[750px] flex flex-col">
              <span className="font-bold text-app-primary mb-2 text-center">Tailored Resume</span>
              {tailoredParsed ? (
                <div className="w-full bg-white border-2 border-app-primary rounded-xl shadow p-6 mb-4">
                  <div className="mb-4">
                    <strong>Experience:</strong>
                    <ul className="list-disc ml-6">
                      {tailoredParsed.experience && tailoredParsed.experience.map((exp, i) => (
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
                  {tailoredParsed.projects && tailoredParsed.projects.length > 0 && (
                    <div className="mb-4">
                      <strong>Projects:</strong>
                      <ul className="list-disc ml-6">
                        {tailoredParsed.projects.map((proj, i) => (
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
                  {tailoredParsed.leadership && tailoredParsed.leadership.length > 0 && (
                    <div className="mb-4">
                      <strong>Leadership & Involvement:</strong>
                      <ul className="list-disc ml-6">
                        {tailoredParsed.leadership.map((lead, i) => (
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
                  {tailoredParsed.skills && tailoredParsed.skills.length > 0 && (
                    <div className="mb-4">
                      <strong>Technical Skills:</strong> {tailoredParsed.skills.join(", ")}
                    </div>
                  )}
                  {tailoredParsed.certifications && tailoredParsed.certifications.length > 0 && (
                    <div className="mb-4">
                      <strong>Certifications:</strong> {tailoredParsed.certifications.join(", ")}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-gray-500">
                  {tailoredResume ? (
                    <div className="w-full bg-white border-2 border-app-primary rounded-xl shadow p-6 mb-4">
                      <h2 className="text-xl font-bold text-app-primary mb-2">Tailored Resume (Raw Format)</h2>
                      <pre className="whitespace-pre-wrap text-sm">{tailoredResume}</pre>
                    </div>
                  ) : (
                    "No tailored resume generated yet."
                  )}
                </div>
              )}
            </div>
          </div>
          {/* Export buttons (existing) */}
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
      )}
    </div>
  );
};

export default TailorResume;