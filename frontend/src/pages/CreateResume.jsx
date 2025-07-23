import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { enhanceResume, exportResume } from "../services/resumeServices";

const CreateResume = () => {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [enhancedResume, setEnhancedResume] = useState("");
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef();
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setFileName(e.target.files[0].name);
      setError("");
    }
  };

  const handleChooseFile = () => {
    fileInputRef.current.click();
  };

  const handleEnhance = async () => {
    if (!file) {
      setError("Please select a file first.");
      return;
    }
    setLoading(true);
    setError("");
    setEnhancedResume("");
    try {
      const data = await enhanceResume(file);
      setEnhancedResume(data.improved_resume);
    } catch (err) {
      setError("Error enhancing resume. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format) => {
    if (!file) {
      setError("Please select a file first.");
      return;
    }
    setExporting(true);
    setError("");
    try {
      const blob = await exportResume(file, format);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `improved_resume.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setError("Error exporting resume. Please try again.");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-app-background flex flex-col items-center justify-center py-20">
      <div className={`w-full ${enhancedResume ? 'max-w-4xl' : 'max-w-2xl'} flex flex-col items-center`}>
        <button
          onClick={() => navigate("/resume")}
          className="mb-6 bg-white text-app-primary px-6 py-3 text-lg rounded-xl border-2 border-app-primary hover:bg-app-primary hover:text-white transition-colors shadow font-semibold"
        >
          ← Back
        </button>
        <div className="bg-white rounded-2xl shadow-2xl p-10 w-full flex flex-col items-center border-2 border-app-primary">
          <h1 className="text-3xl font-extrabold text-app-primary mb-8">Create or Enhance Your Resume</h1>
          <input
            type="file"
            accept=".pdf,.docx"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
          />
          <button
            onClick={handleChooseFile}
            className="bg-app-primary text-white px-8 py-3 text-lg rounded-xl mb-6 hover:bg-app-primary/90 transition-colors font-semibold"
          >
            {fileName ? `Selected: ${fileName}` : "Choose File"}
          </button>
          <button
            onClick={handleEnhance}
            disabled={!file || loading}
            className="bg-app-primary text-white px-8 py-3 text-lg rounded-xl mb-6 hover:bg-app-primary/90 transition-colors disabled:opacity-50 font-semibold"
          >
            {loading ? <div className="loader-md mr-2"></div> : null}
            {loading ? "Enhancing..." : "Enhance with AI"}
          </button>
          {error && (
            <div className="mb-6 text-red-600 font-bold text-lg">{error}</div>
          )}
          {enhancedResume && (
            <>
              <textarea
                className="w-full h-72 border-2 border-app-primary rounded-xl p-5 mb-6 text-lg"
                value={enhancedResume}
                readOnly
              />
              <div className="flex gap-6 mt-2">
                <button
                  onClick={() => handleExport("pdf")}
                  disabled={exporting}
                  className="bg-app-primary text-white px-6 py-3 text-lg rounded-xl hover:bg-app-primary/90 transition-colors disabled:opacity-50 font-semibold"
                >
                  Export as PDF
                </button>
                <button
                  onClick={() => handleExport("docx")}
                  disabled={exporting}
                  className="bg-app-primary text-white px-6 py-3 text-lg rounded-xl hover:bg-app-primary/90 transition-colors disabled:opacity-50 font-semibold"
                >
                  Export as Word
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateResume; 