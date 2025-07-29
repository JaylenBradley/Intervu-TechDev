import ResumePageLayout from "../components/ResumePageLayout";
import {useState, useRef, useEffect} from "react";
import { useNavigate } from "react-router-dom";
import { useNotification } from "../components/NotificationProvider";
import { uploadResume } from "../services/resumeServices";

const UploadResume = ({ user }) => {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef();
  const navigate = useNavigate();
  const { showNotification } = useNotification();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file first.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await uploadResume(user.id, file);
      showNotification("Resume uploaded and parsed successfully!", "success");
      navigate("/resume");
    } catch (err) {
      setError("Error uploading resume. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ResumePageLayout cardClassName="w-full">
      <h1 className="text-3xl font-extrabold text-app-primary mb-4">Upload Your Resume</h1>
      <input
        type="file"
        accept=".pdf,.docx"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
      />
      <button
        onClick={handleChooseFile}
        className="btn-primary px-8 py-3 rounded-xl mb-4 cursor-pointer"
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
          "Upload Resume"
        )}
      </button>
    </ResumePageLayout>
  );
};

export default UploadResume; 