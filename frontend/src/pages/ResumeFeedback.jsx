import ResumePageLayout from "../components/ResumePageLayout";
import { useEffect, useState } from "react";
import { getResumeFeedbackByUserId } from "../services/resumeServices";
import { parseFeedback } from "../utils/resumeParser";

const ResumeFeedback = ({ user }) => {
  const [feedback, setFeedback] = useState([]);
  const [rawFeedback, setRawFeedback] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
      const data = await getResumeFeedbackByUserId(user.id);
      if (!data.feedback) throw new Error("No feedback received from server");
      if (data.structured_feedback && data.structured_feedback.length > 0) {
        setFeedback(data.structured_feedback);
        setRawFeedback("");
      } else {
        const parsedFeedback = parseFeedback(data.feedback);
        if (parsedFeedback.length > 0) {
          setFeedback(parsedFeedback);
          setRawFeedback("");
        } else {
          setRawFeedback(data.feedback);
        }
      }
    } catch (err) {
      setError("Error getting feedback. Please try again.");
    } finally {
      setLoading(false);
    }
  };

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
              <div key={idx} className="bg-app-accent border border-app-primary rounded-2xl p-4 mb-4">
                <div className="text-app-text whitespace-pre-wrap">{para}</div>
              </div>
            ))}
          </div>
        );
      }
      return (
        <div className="w-full mt-4">
          {pairs.map((pair, idx) => (
            <div key={idx} className="bg-app-accent border border-app-primary rounded-2xl p-4 mb-4">
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
    <ResumePageLayout cardClassName="w-full">
      <h1 className="text-3xl font-extrabold text-app-primary mb-4">Get Resume Feedback</h1>
      <button
        onClick={handleGetFeedback}
        disabled={loading}
        className="btn-primary font-bold px-8 py-3 rounded-xl mb-4 cursor-pointer min-w-[200px] min-h-[56px] flex items-center justify-center"
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <div className="loader-md" /> Getting Feedback...
          </span>
        ) : (
          "Get Feedback"
        )}
      </button>
      {error && (
        <div className="mb-4 text-red-600 font-bold text-lg">{error}</div>
      )}
      {feedback.length > 0 ? renderStructured() : null}
      {rawFeedback && !feedback.length ? renderParsed() : null}
    </ResumePageLayout>
  );
};

export default ResumeFeedback;