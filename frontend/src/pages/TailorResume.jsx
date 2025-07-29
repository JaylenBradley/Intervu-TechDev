import ResumePageLayout from "../components/ResumePageLayout";
import { useState, useRef, useEffect } from "react";
import { tailorResumeToJobDescription, fetchUserResume, exportTailoredResume } from "../services/resumeServices";

const TailorResume = ({ user }) => {
  const [jobDescription, setJobDescription] = useState("");
  const [tailoredResume, setTailoredResume] = useState("");
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [exporting, setExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState(null);
  const jobDescRef = useRef();

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
      const data = await tailorResumeToJobDescription(user.id, jobDescription);
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

  const getBullets = (desc) => {
    if (!desc) return [];
    if (Array.isArray(desc)) {
      return desc.filter(item => item && item.trim());
    }
    if (typeof desc === 'string') {
      let bullets = desc
        .split(/\r?\n/)
        .map(line => line.replace(/^[-\u2022\u25aa\s]+/, '').trim())
        .filter(Boolean);
      if (bullets.length <= 1) {
        bullets = desc
          .split(/\. (?=[A-Z])|\.(?=[A-Z])| (?=Led |Implemented |Designed |Built |Created |Developed |Managed |Coordinated |Organized |Produced |Launched |Founded |Started |Initiated |Oversaw |Directed |Supervised |Enhanced |Improved |Increased |Reduced |Streamlined |Automated |Analyzed |Researched |Presented |Taught |Mentored |Tutored |Assisted |Supported |Collaborated )/g)
          .map(line => line.replace(/^[-\u2022\u25aa\s]+/, '').trim())
          .filter(Boolean);
      }
      return bullets;
    }
    return [];
  };

  const cleanTailoredData = (data) => {
    if (!data) return null;
    if (data.experience) {
      data.experience.forEach(exp => {
        if (exp.description && Array.isArray(exp.description)) {
          exp.description = exp.description
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

  let tailoredParsed = null;
  try {
    tailoredParsed = tailoredResume ? JSON.parse(tailoredResume) : null;
    if (tailoredParsed) {
      tailoredParsed = cleanTailoredData(tailoredParsed);
    }
  } catch (e) {
    tailoredParsed = null;
  }

  return (
    <ResumePageLayout cardClassName="w-5xl">
      <h1 className="text-3xl font-extrabold text-app-primary mb-4">Tailor Resume to Job Description</h1>
      <p className="text-lg text-app-text text-center mb-8">
        The tailored resume will only use information <br/> from your resume and the job description
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
        className="btn-primary font-bold  px-8 py-3 rounded-xl mb-4 cursor-pointer min-w-[200px] min-h-[56px] flex items-center justify-center"
      >
        {loading ? (
          <span className="flex items-center gap-2 ">
            <div className="loader-md" /> Generating...
          </span>
        ) : (
          "Generate Tailored Resume"
        )}
      </button>
      {error && (
        <div className="mb-4 text-red-600 font-bold text-lg">{error}</div>
      )}
      {tailoredResume && (
        <div className="w-full p-3 flex flex-col items-center mt-8">
          <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
            {/* Current Resume */}
            <div className="flex flex-col">
              <span className="font-bold text-app-primary text-center text-3xl mb-2 ">Current Resume</span>
              <div className="w-full bg-white border border-app-primary rounded-2xl shadow-xl p-6 mb-4 transition-all duration-200">
                {resume ? (
                  <>
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
                  </>
                ) : (
                  <div className="text-gray-500">No resume found.</div>
                )}
              </div>
            </div>
            {/* Tailored Resume */}
            <div className="flex flex-col">
              <span className="font-bold text-app-primary text-center text-3xl mb-2">Tailored Resume</span>
              <div className="w-full bg-white border border-app-primary rounded-2xl shadow-xl p-6 mb-4 transition-all duration-200">
                {tailoredParsed ? (
                  <>
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
                        <strong>Leadership:</strong>
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
                        <strong>Skills:</strong> {tailoredParsed.skills.join(", ")}
                      </div>
                    )}
                    {tailoredParsed.certifications && tailoredParsed.certifications.length > 0 && (
                      <div className="mb-4">
                        <strong>Certifications:</strong> {tailoredParsed.certifications.join(", ")}
                      </div>
                    )}
                  </>
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
          </div>
          <div className="flex gap-4 mt-4 justify-center w-full">
            <button
              onClick={() => handleExport("pdf")}
              disabled={exporting}
              className="btn-primary px-6 py-2 rounded-lg font-semibold hover:bg-app-primary/90 transition-colors flex items-center justify-center min-w-[160px] min-h-[44px] cursor-pointer"
            >
              {exporting && exportFormat === "pdf" ? <div className="loader-md" /> : "Export as PDF"}
            </button>
            <button
              onClick={() => handleExport("docx")}
              disabled={exporting}
              className="btn-primary px-6 py-2 rounded-lg font-semibold hover:bg-app-primary/90 transition-colors flex items-center justify-center min-w-[160px] min-h-[44px] cursor-pointer"
            >
              {exporting && exportFormat === "docx" ? <div className="loader-md" /> : "Export as Word"}
            </button>
          </div>
        </div>
      )}
    </ResumePageLayout>
  );
};

export default TailorResume;