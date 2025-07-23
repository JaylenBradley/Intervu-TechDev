import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

// Helper to parse raw feedback string into structured data
function parseFeedback(raw) {
  if (typeof raw !== "string") return [];
  const lines = raw.split(/\r?\n/).map(l => l.trim());
  const pairs = [];
  let current = {};
  lines.forEach(line => {
    if (line.startsWith("Original:")) {
      if (current.original || current.feedback) pairs.push(current);
      // Remove bullet point symbols (• or -) from the original text
      let originalText = line.replace("Original:", "").trim();
      originalText = originalText.replace(/^[•\-]\s*/, ""); // Remove leading bullet point
      current = { original: originalText, feedback: "", options: [] };
    } else if (line.startsWith("Feedback:")) {
      current.feedback = line.replace("Feedback:", "").trim();
    } else if (line.startsWith("- Option")) {
      current.options = current.options || [];
      current.options.push(line.replace(/- Option \d+:/, "").trim());
    } else if (line && (current.feedback || current.original)) {
      // If it's a non-empty line after feedback, treat as extra feedback or option
      if (current.options && current.options.length > 0) {
        current.options[current.options.length - 1] += " " + line;
      } else if (!current.feedback) {
        current.feedback = line;
      }
    }
  });
  if (current.original || current.feedback) pairs.push(current);
  
  // Filter out pairs that don't have options (they should always have suggestions)
  return pairs.filter(pair => pair.options && pair.options.length >= 2);
}

const ResumeFeedback = ({ user }) => {
  const [feedback, setFeedback] = useState([]);
  const [rawFeedback, setRawFeedback] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleGetFeedback = async () => {
    if (!user || !user.id) {
      setError("User not found");
      return;
    }
    setLoading(true);
    setError("");
    setFeedback([]);
    setRawFeedback("");
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL || "http://localhost:8000"}/api/resume/feedback?user_id=${user.id}`);
      if (!res.ok) throw new Error("Failed to get feedback");
      const data = await res.json();
      if (!data.feedback) throw new Error("No feedback received from server");
      let feedbackArr = [];
      if (typeof data.feedback === "string" && data.feedback.trim().startsWith("[")) {
        try {
          feedbackArr = JSON.parse(data.feedback);
        } catch {
          feedbackArr = [];
        }
      }
      if (feedbackArr.length > 0 && feedbackArr[0].bullet) {
        setFeedback(feedbackArr);
      } else {
        setRawFeedback(data.feedback);
      }
    } catch (err) {
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

  const renderParsed = () => {
    try {
      const pairs = parseFeedback(rawFeedback);
      if (pairs.length === 0) {
        const paras = rawFeedback.split(/\n{2,}|\r{2,}/).filter(p => p.trim());
        return (
          <div className="w-full mt-4">
            {paras.map((para, idx) => (
              <div key={idx} style={{ marginBottom: '1.5em' }} className="bg-app-accent border border-app-primary rounded-2xl p-4">
                <div className="text-app-text whitespace-pre-wrap">{para}</div>
              </div>
            ))}
          </div>
        );
      }
      return (
        <div className="w-full mt-4">
          {pairs.map((pair, idx) => (
            <div key={idx} style={{ marginBottom: '1.5em' }} className="bg-app-accent border border-app-primary rounded-2xl p-4">
              {pair.original && <div><strong>Original:</strong> {pair.original}</div>}
              {pair.feedback && <div><strong>Feedback:</strong> {pair.feedback}</div>}
              {pair.options && pair.options.length > 0 && (
                <div>
                  {pair.options.map((opt, i) => (
                    <div key={i}><strong>Option {i + 1}:</strong> {opt}</div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      );
    } catch (error) {
      return (
        <div className="w-full mt-4 p-4 bg-red-100 border border-red-400 rounded-lg">
          <p className="text-red-700">Error displaying feedback. Showing raw text instead.</p>
          <pre className="mt-2 text-sm text-red-600 whitespace-pre-wrap">{rawFeedback}</pre>
        </div>
      );
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center py-16">
      <div className={`w-full ${feedback.length > 0 || rawFeedback ? 'max-w-4xl' : 'max-w-2xl'} flex flex-col items-center`}>
        <button
          onClick={() => navigate("/resume")}
          className="mb-6 bg-white text-app-primary px-6 py-3 text-lg rounded-xl border-2 border-app-primary hover:bg-app-primary hover:text-white transition-colors shadow font-semibold"
        >
          ← Back
        </button>
        <div className="bg-white rounded-2xl shadow-2xl p-10 w-full flex flex-col items-center border-2 border-app-primary">
          <h1 className="text-3xl font-extrabold text-app-primary mb-8">Get Resume Feedback</h1>
          <button
            onClick={handleGetFeedback}
            disabled={loading}
            className="bg-app-primary text-white px-8 py-3 text-lg rounded-xl mb-6 hover:bg-app-primary/90 transition-colors disabled:opacity-50 font-semibold flex items-center justify-center min-w-[200px] min-h-[56px]"
          >
            {loading ? <div className="loader-md" /> : "Get Feedback"}
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