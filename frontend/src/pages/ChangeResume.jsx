import ResumePageLayout from "../components/ResumePageLayout";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useNotification } from "../components/NotificationProvider";
import { uploadResume } from "../services/resumeServices";

const ChangeResume = ({ user }) => {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef();
  const navigate = useNavigate();
  const { showNotification } = useNotification();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleChooseFile = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    setFile(selected);
    setFileName(selected ? selected.name : "");
  };

  const handleUpload = async () => {
    if (!file) {
      showNotification("Please select a file first.", "error");
      return;
    }
    setLoading(true);
    try {
      await uploadResume(user.id, file);
      showNotification("Resume updated successfully!", "success");
      navigate("/resume");
    } catch {
      showNotification("Failed to update resume. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ResumePageLayout cardClassName="w-full">
      <h1 className="text-3xl font-extrabold text-app-primary mb-4">Change Your Resume</h1>
      <input
        type="file"
        accept=".pdf,.docx"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
      />
      <button
        onClick={handleChooseFile}
        className="btn-primary font-bold px-8 py-3 rounded-xl mb-4 cursor-pointer"
      >
        {fileName ? `Selected: ${fileName}` : "Choose File"}
      </button>
      <button
        onClick={handleUpload}
        disabled={!file || loading}
        className="btn-primary font-bold px-8 py-3 rounded-xl mb-4 cursor-pointer min-w-[200px] min-h-[56px]"
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <div className="loader-md" /> Uploading...
          </span>
        ) : (
          "Update Resume"
        )}
      </button>
    </ResumePageLayout>
  );
};

export default ChangeResume;