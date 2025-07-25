import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const CreateResume = ({ user }) => {
  const [improvedResume, setImprovedResume] = useState("");
  const [improving, setImproving] = useState(false);
  const [improveError, setImproveError] = useState("");
  const [exporting, setExporting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleImproveResume = async () => {
    setImproving(true);
    setImproveError("");
    setImprovedResume("");
    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL || "http://localhost:8000"}/api/resume/improve?user_id=${user.id}`
      );
      if (!res.ok) {
        const data = await res.json();
        setImproveError(data.detail || "Failed to improve resume.");
        return;
      }
      const data = await res.json();
      setImprovedResume(data.improved_resume);
    } catch (err) {
      setImproveError("Error improving resume. Please try again.");
    } finally {
      setImproving(false);
    }
  };

  const handleExport = async (format) => {
    setExporting(true);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL || "http://localhost:8000"}/api/resume/export?user_id=${user.id}&format=${format}`
      );
      if (!res.ok) throw new Error("Failed to export resume");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `improved_resume.${format === "pdf" ? "pdf" : "docx"}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert("Error exporting resume. Please try again.");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center py-16">
      <div className={`w-full max-w-2xl flex flex-col items-center`}>
        <button
          onClick={() => navigate("/resume")}
          className="mb-6 bg-white text-app-primary px-6 py-3 text-lg rounded-xl border-2 border-app-primary hover:bg-app-primary hover:text-white transition-colors shadow font-semibold"
        >
          ← Back
        </button>
        <div className="bg-white rounded-2xl shadow-2xl p-10 w-full flex flex-col items-center border-2 border-app-primary">
          <h1 className="text-3xl font-extrabold text-app-primary mb-8">Improve Your Resume</h1>
          <button
            onClick={handleImproveResume}
            disabled={improving}
            className="bg-app-primary text-white px-8 py-3 text-lg rounded-xl mb-6 hover:bg-app-primary/90 transition-colors font-semibold flex items-center justify-center min-w-[200px] min-h-[56px]"
          >
            {improving ? (
              <div className="loader-md" />
            ) : (
              "Improve Resume"
            )}
          </button>
          {improveError && (
            <div className="mb-6 text-red-600 font-bold text-lg">{improveError}</div>
          )}
          {improvedResume && (
            <>
              <textarea
                className="w-full h-72 border-2 border-app-primary rounded-xl p-5 mt-4 text-lg"
                value={improvedResume}
                readOnly
              />
              <div className="flex gap-4 mt-6">
                <button
                  onClick={() => handleExport("pdf")}
                  disabled={exporting}
                  className="bg-app-primary text-white px-6 py-2 rounded-lg font-semibold hover:bg-app-primary/90 transition-colors flex items-center justify-center min-w-[160px] min-h-[44px]"
                >
                  {exporting ? <div className="loader-md" /> : "Export as PDF"}
                </button>
                <button
                  onClick={() => handleExport("docx")}
                  disabled={exporting}
                  className="bg-app-primary text-white px-6 py-2 rounded-lg font-semibold hover:bg-app-primary/90 transition-colors flex items-center justify-center min-w-[160px] min-h-[44px]"
                >
                  {exporting ? <div className="loader-md" /> : "Export as Word"}
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