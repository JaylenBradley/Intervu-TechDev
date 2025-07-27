import {useEffect, useState} from "react";
import { useNavigate } from "react-router-dom";

// Helper to parse raw feedback string into structured data
function parseFeedback(raw) {
  if (typeof raw !== "string") return [];
  
  // Use a more robust regex approach to find all Original: sections
  const pattern = /Original:\s*([^\n]+)\s*Grade:\s*([^\n]+)\s*Feedback:\s*([^\n]+(?:\n(?!- Option)[^\n]+)*)\s*(- Option 1:[^\n]+(?:\n(?!- Option)[^\n]+)*)\s*(- Option 2:[^\n]+(?:\n(?!Original:)[^\n]+)*)/g;
  
  const matches = [...raw.matchAll(pattern)];
  const pairs = [];
  
  for (const match of matches) {
    const originalText = match[1].trim().replace(/^[•\-]\s*/, '').replace(/^\s*[•\-]\s*/, '').trim();
    const grade = match[2].trim();
    const feedback = match[3].trim();
    const option1 = match[4].replace('- Option 1:', '').trim();
    const option2 = match[5].replace('- Option 2:', '').trim();
    
    // Skip items that are just intro text
    if (originalText.toLowerCase().includes('detailed analysis') || 
        originalText.toLowerCase().includes('here\'s') ||
        originalText.toLowerCase().includes('analysis of')) {
      continue;
    }
    
         // Clean up options
     const completeOptions = [];
     for (const option of [option1, option2]) {
       const optionText = option.trim();
       if (optionText.length > 15 && 
           !optionText.endsWith('...') && 
           !optionText.endsWith('..') &&
           !optionText.endsWith('etc') &&
           !optionText.endsWith('etc.')) {
         completeOptions.push(optionText);
       }
     }
    
    if (completeOptions.length >= 2) {
      pairs.push({
        original: originalText,
        grade: grade,
        feedback: feedback,
        options: completeOptions
      });
    }
  }
  
  console.log("Parsed pairs:", pairs);
  return pairs;
}

const ResumeFeedback = ({ user }) => {
  const [feedback, setFeedback] = useState([]);
  const [rawFeedback, setRawFeedback] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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
      
      // Handle structured feedback from backend
      console.log("Backend response:", data);
      if (data.structured_feedback && data.structured_feedback.length > 0) {
        console.log("Using structured feedback:", data.structured_feedback);
        setFeedback(data.structured_feedback);
        setRawFeedback("");
      } else {
        // Fallback to parsing raw feedback
        console.log("No structured feedback, parsing raw feedback");
        console.log("Raw feedback length:", data.feedback?.length);
        
        // Try to parse the raw feedback into structured format
        const parsedFeedback = parseFeedback(data.feedback);
        if (parsedFeedback.length > 0) {
          console.log("Successfully parsed raw feedback into structured format:", parsedFeedback);
          setFeedback(parsedFeedback);
          setRawFeedback("");
        } else {
          // If parsing fails, show the raw feedback
          console.log("Failed to parse feedback, showing raw feedback");
          setRawFeedback(data.feedback);
        }
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
        <div key={idx} className="bg-white border-2 border-app-primary rounded-xl shadow-lg p-6 mb-4">
          <div className="font-bold text-app-primary mb-3 text-lg">{item.original || item.bullet}</div>
          {item.grade && (
            <div className="mb-3">
              <strong className="text-app-text">Grade:</strong> 
              <span className={`ml-2 px-3 py-1 rounded-full text-sm font-bold ${
                item.grade.includes('9') || item.grade.includes('10') ? 'bg-green-100 text-green-800' :
                item.grade.includes('7') || item.grade.includes('8') ? 'bg-blue-100 text-blue-800' :
                item.grade.includes('5') || item.grade.includes('6') ? 'bg-yellow-100 text-yellow-800' :
                item.grade.includes('3') || item.grade.includes('4') ? 'bg-orange-100 text-orange-800' :
                'bg-red-100 text-red-800'
              }`}>
                {item.grade}
              </span>
            </div>
          )}
          <div className="text-app-text mb-3 bg-gray-50 p-3 rounded-lg">
            <strong className="text-app-primary">Feedback:</strong> {item.feedback}
          </div>
          {item.options && item.options.length > 0 && (
            <div className="mt-3">
              <strong className="text-app-primary">Suggestions:</strong>
              <ul className="list-disc ml-6 mt-2 space-y-2">
                {item.options.map((opt, i) => (
                  <li key={i} className="text-app-text bg-gray-50 p-2 rounded">
                    {opt}
                  </li>
                ))}
              </ul>
            </div>
          )}
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
              {pair.grade && (
                <div className="mt-2">
                  <strong>Grade:</strong> 
                  <span className={`ml-2 px-3 py-1 rounded-full text-sm font-bold ${
                    pair.grade.includes('9') || pair.grade.includes('10') ? 'bg-green-100 text-green-800' :
                    pair.grade.includes('7') || pair.grade.includes('8') ? 'bg-blue-100 text-blue-800' :
                    pair.grade.includes('5') || pair.grade.includes('6') ? 'bg-yellow-100 text-yellow-800' :
                    pair.grade.includes('3') || pair.grade.includes('4') ? 'bg-orange-100 text-orange-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {pair.grade}
                  </span>
                </div>
              )}
              {pair.feedback && <div className="mt-2"><strong>Feedback:</strong> {pair.feedback}</div>}
              {pair.options && pair.options.length > 0 && (
                <div className="mt-2">
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
          {rawFeedback && !feedback.length ? renderParsed() : null}

        </div>
      </div>
    </div>
  );
};

export default ResumeFeedback; 
