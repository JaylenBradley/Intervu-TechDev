import {useState, useRef, useEffect} from "react";
import { useNavigate } from "react-router-dom";
import { useNotification } from "../components/NotificationProvider";
<<<<<<< HEAD
import { syncUserProfile } from "../services/userServices";
=======
import { uploadResume } from "../services/resumeServices";
>>>>>>> justin/dev

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
<<<<<<< HEAD
      const formData = new FormData();
      formData.append("file", file);
      formData.append("user_id", user.id);
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL || "http://localhost:8000"}/api/resume/upload`, {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("Failed to upload resume");
      await syncUserProfile(user.id);
=======
      await uploadResume(user.id, file);
>>>>>>> justin/dev
      showNotification("Resume uploaded and parsed successfully!", "success");
      navigate("/resume");
    } catch (err) {
      setError("Error uploading resume. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-app-accent flex flex-col items-center justify-center py-20">
      <div className={`w-full max-w-2xl flex flex-col items-center`}>
        <button
          onClick={() => navigate("/")}
          className="mb-6 bg-white text-app-primary px-6 py-3 text-lg rounded-xl border-2 border-app-primary hover:bg-app-primary hover:text-white transition-colors shadow font-semibold"
        >
          ← Back
        </button>
        <div className="bg-app-accent rounded-2xl shadow-2xl p-10 w-full flex flex-col items-center border-2 border-app-primary">
          <h1 className="text-3xl font-extrabold text-app-primary mb-8">Upload Your Resume</h1>
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
            onClick={handleUpload}
            disabled={!file || loading}
            className="bg-app-primary text-white px-8 py-3 text-lg rounded-xl mb-6 hover:bg-app-primary/90 transition-colors disabled:opacity-50 font-semibold flex items-center justify-center min-w-[200px] min-h-[56px]"
          >
            {loading ? <div className="loader-md" /> : "Upload Resume"}
          </button>
          {error && (
            <div className="mb-6 text-red-600 font-bold text-lg">{error}</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UploadResume; 