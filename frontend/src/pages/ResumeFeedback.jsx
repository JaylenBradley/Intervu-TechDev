import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

// Helper to parse raw feedback string into structured data
function parseFeedback(raw) {
  if (typeof raw !== "string") return [];
  const lines = raw.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const sections = [];
  let currentPosition = null;
  let currentBullet = null;
  let inOptions = false;

  lines.forEach(line => {
    if (line.startsWith("Position:")) {
      if (currentPosition) sections.push(currentPosition);
      currentPosition = { position: line.replace("Position:", "").trim(), bullets: [] };
      currentBullet = null;
      inOptions = false;
    } else if (line.startsWith("Original:")) {
      if (currentBullet) currentPosition?.bullets.push(currentBullet);
      currentBullet = { original: line.replace("Original:", "").trim(), feedback: "", options: [] };
      inOptions = false;
    } else if (line.startsWith("Feedback:")) {
      if (currentBullet) currentBullet.feedback = line.replace("Feedback:", "").trim();
      inOptions = false;
    } else if (line.startsWith("- Option")) {
      if (currentBullet) currentBullet.options.push(line.replace(/- Option \d+:/, "").trim());
      inOptions = true;
    } else if (inOptions && currentBullet) {
      // Option lines may wrap
      currentBullet.options[currentBullet.options.length - 1] += " " + line;
    }
  });
  if (currentBullet) currentPosition?.bullets.push(currentBullet);
  if (currentPosition) sections.push(currentPosition);
  return sections.filter(s => s.position || s.bullets.length > 0);
}

const ResumeFeedback = () => {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [feedback, setFeedback] = useState([]);
  const [rawFeedback, setRawFeedback] = useState("");
  const [loading, setLoading] = useState(false);
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

  const handleGetFeedback = async () => {
    if (!file) {
      setError("Please select a file first.");
      return;
    }
    setLoading(true);
    setError("");
    setFeedback([]);
    setRawFeedback("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL || "http://localhost:8000"}/api/resume/feedback`, {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("Failed to get feedback");
      const data = await res.json();
      console.log("Raw API response:", data); // Debug log
      console.log("Feedback type:", typeof data.feedback); // Debug log
      console.log("Feedback length:", data.feedback?.length); // Debug log
      let feedbackArr = [];
      if (typeof data.feedback === "string" && data.feedback.trim().startsWith("[")) {
        // Try to parse as JSON array
        try {
          feedbackArr = JSON.parse(data.feedback);
          console.log("Parsed as JSON array:", feedbackArr); // Debug log
        } catch {
          feedbackArr = [];
          console.log("Failed to parse as JSON"); // Debug log
        }
      }
      if (feedbackArr.length > 0 && feedbackArr[0].bullet) {
        console.log("Setting structured feedback"); // Debug log
        setFeedback(feedbackArr);
      } else {
        console.log("Setting raw feedback"); // Debug log
        setRawFeedback(data.feedback);
      }
    } catch (err) {
      console.error("Error in handleGetFeedback:", err); // Debug log
      setError("Error getting feedback. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // If feedback is structured, render as before
  const renderStructured = () => (
    <div className="w-full flex flex-col gap-4 mt-4">
      {feedback.map((item, idx) => (
        <div key={idx} className="bg-app-accent border border-app-primary rounded-lg p-4">
          <div className="font-semibold text-app-primary mb-2">{item.bullet}</div>
          <div className="text-app-text">{item.feedback}</div>
        </div>
      ))}
    </div>
  );

  // Helper to flatten all bullets with their position
  function flattenBullets(sections) {
    const result = [];
    sections.forEach(section => {
      section.bullets.forEach(bullet => {
        result.push({ ...bullet, position: section.position });
      });
    });
    return result;
  }

  // Updated renderParsed for two-giant-divs layout
  const renderParsed = () => {
    const sections = parseFeedback(rawFeedback);
    const allBullets = flattenBullets(sections);
    // Split bullets into two columns
    const mid = Math.ceil(allBullets.length / 2);
    const col1 = allBullets.slice(0, mid);
    const col2 = allBullets.slice(mid);
    return (
      <div className="w-full flex flex-row gap-8 mt-4">
        <div className="flex-1 flex flex-col gap-6">
          {col1.map((b, idx) => (
            <div key={idx} className="bg-app-accent border border-app-primary rounded-2xl p-6">
              {b.position && (
                <div className="text-xl font-bold text-app-primary mb-2">{b.position}</div>
              )}
              <div className="font-semibold text-app-primary mb-1">Original:</div>
              <div className="mb-2 text-app-text">{b.original}</div>
              <div className="font-semibold text-app-primary mb-1">Feedback:</div>
              <div className="mb-2 text-app-text">{b.feedback}</div>
              {b.options.length > 0 && (
                <div className="font-semibold text-app-primary mb-1">Suggestions:</div>
              )}
              <ul className="list-disc ml-6 text-app-text mb-2">
                {b.options.map((opt, k) => (
                  <li key={k}>{opt}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="flex-1 flex flex-col gap-6">
          {col2.map((b, idx) => (
            <div key={idx} className="bg-app-accent border border-app-primary rounded-2xl p-6">
              {b.position && (
                <div className="text-xl font-bold text-app-primary mb-2">{b.position}</div>
              )}
              <div className="font-semibold text-app-primary mb-1">Original:</div>
              <div className="mb-2 text-app-text">{b.original}</div>
              <div className="font-semibold text-app-primary mb-1">Feedback:</div>
              <div className="mb-2 text-app-text">{b.feedback}</div>
              {b.options.length > 0 && (
                <div className="font-semibold text-app-primary mb-1">Suggestions:</div>
              )}
              <ul className="list-disc ml-6 text-app-text mb-2">
                {b.options.map((opt, k) => (
                  <li key={k}>{opt}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-app-background flex flex-col items-center justify-center py-20">
      <div className="w-full max-w-4xl flex flex-col items-center">
        <button
          onClick={() => navigate("/resume")}
          className="mb-6 bg-white text-app-primary px-6 py-3 text-lg rounded-xl border-2 border-app-primary hover:bg-app-primary hover:text-white transition-colors shadow font-semibold"
        >
          ← Back
        </button>
        <div className="bg-white rounded-2xl shadow-2xl p-10 w-full flex flex-col items-center border-2 border-app-primary">
          <h1 className="text-3xl font-extrabold text-app-primary mb-8">Get Resume Feedback</h1>
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
            onClick={handleGetFeedback}
            disabled={!file || loading}
            className="bg-app-primary text-white px-8 py-3 text-lg rounded-xl mb-6 hover:bg-app-primary/90 transition-colors disabled:opacity-50 font-semibold"
          >
            {loading ? "Analyzing..." : "Get Feedback"}
          </button>
          {error && (
            <div className="mb-6 text-red-600 font-bold text-lg">{error}</div>
          )}
          {feedback.length > 0 ? renderStructured() : null}
          {rawFeedback && renderParsed()}
        </div>
      </div>
    </div>
  );
};

export default ResumeFeedback; 