import ResumePageLayout from "../components/ResumePageLayout";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useNotification } from "../components/NotificationProvider";
import { improveResumeByUserId } from "../services/resumeServices";

const CreateResume = ({ user }) => {
  const [improving, setImproving] = useState(false);
  const [improveError, setImproveError] = useState("");
  const [improvedResume, setImprovedResume] = useState("");
  const [exporting, setExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState(null);
  const navigate = useNavigate();
  const { showNotification } = useNotification();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleImproveResume = async () => {
    setImproving(true);
    setImproveError("");
    setImprovedResume("");
    try {
      const data = await improveResumeByUserId(user.id);
      setImprovedResume(data.improved_resume);
    } catch (err) {
      setImproveError("Error improving resume. Please try again.");
    } finally {
      setImproving(false);
    }
  };

  const handleExport = async (format) => {
    setExporting(true);
    setExportFormat(format);
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
      showNotification("Error exporting resume. Please try again.", "error");
    } finally {
      setExporting(false);
      setExportFormat(null);
    }
  };

  return (
    <ResumePageLayout cardClassName="w-full">
      <h1 className="text-3xl font-extrabold text-app-primary mb-4">Improve Your Resume</h1>
      <button
        onClick={handleImproveResume}
        disabled={improving}
        className="btn-primary font-bold px-8 py-3 rounded-xl mb-4 cursor-pointer min-w-[200px] min-h-[56px]"
      >
        {improving ? (
          <span className="flex items-center gap-2">
            <div className="loader-md" /> Improving...
          </span>
        ) : (
          "Improve Resume"
        )}
      </button>
      {improveError && (
        <div className="mb-4 text-red-600 font-bold text-lg">{improveError}</div>
      )}
      {improvedResume && (
        <div className="w-full bg-white border-2 border-app-primary rounded-xl shadow p-6 mb-4 whitespace-pre-wrap text-base">
          {improvedResume}
        </div>
      )}
      {improvedResume && (
        <div className="flex gap-4 mt-2">
          <button
            onClick={() => handleExport("pdf")}
            disabled={exporting}
            className="btn-primary px-6 py-2 rounded-lg font-semibold hover:bg-app-primary/90 transition-colors
            flex items-center justify-center min-w-[160px] min-h-[44px] cursor-pointer"
          >
            {exporting && exportFormat === "pdf" ? <div className="loader-md" /> : "Export as PDF"}
          </button>
          <button
            onClick={() => handleExport("docx")}
            disabled={exporting}
            className="
              btn-primary px-6 py-2 rounded-lg font-semibold hover:bg-app-primary/90 transition-colors
              flex items-center justify-center min-w-[160px] min-h-[44px] cursor-pointer"
          >
            {exporting && exportFormat === "docx" ? <div className="loader-md" /> : "Export as Word"}
          </button>
        </div>
      )}
    </ResumePageLayout>
  );
};

export default CreateResume;