import { useEffect, useState, useRef } from "react";
import { fetchQuestionnaire } from "../services/questionnaireServices";
import { getBehavioralQuestions, getBehavioralFeedback } from "../services/behavioralPrepServices"; // You’ll need to implement these
import { FaMicrophone, FaMicrophoneSlash } from "react-icons/fa";

const instructions = `
Welcome to Behavioral Interview Prep!
1. Review your Target Role and Company (auto-filled from your questionnaire).
2. Choose the number of questions (1-10) and difficulty.
3. Click "Generate Questions" to get tailored behavioral questions.
4. Select any question from the dropdown to answer.
5. Click the microphone button to start/stop recording your answer.
6. After submitting, you'll get real-time feedback for each answer.
7. You can answer as many or as few questions as you like. Click "Done" to finish.
`;

const BehavioralPrep = ({ user }) => {
  const [form, setForm] = useState({
    target_role: "",
    company: "",
    num_questions: 3,
    difficulty: "Medium",
  });
  const [questions, setQuestions] = useState([]);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [answer, setAnswer] = useState("");
  const [recording, setRecording] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const recognitionRef = useRef(null);

  // Fetch questionnaire for auto-fill
  useEffect(() => {
    const load = async () => {
      if (!user) return;
      try {
        const data = await fetchQuestionnaire(user.id);
        setForm(f => ({
          ...f,
          target_role: data.career_goal || "",
          company: (data.target_companies && data.target_companies[0]) || "",
        }));
      } catch (err) {
        setError("Failed to fetch questionnaire data.");
      }
    };
    load();
  }, [user]);

  // Handle form changes
  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  // Generate questions
  const handleGenerate = async e => {
    e.preventDefault();
    setGenerating(true);
    setError("");
    setQuestions([]);
    setFeedback("");
    try {
      const qs = await getBehavioralQuestions(form);
      setQuestions(qs);
      setSelectedIdx(0);
    } catch (err) {
      setError("Failed to generate questions.");
    } finally {
      setGenerating(false);
    }
  };

  // Speech-to-text logic (Web Speech API)
  const handleRecord = () => {
    if (!recording) {
      if (!("webkitSpeechRecognition" in window)) {
        setError("Speech recognition not supported in this browser.");
        return;
      }
      setError("");
      const recognition = new window.webkitSpeechRecognition();
      recognition.lang = "en-US";
      recognition.interimResults = true;
      recognition.continuous = false;
      recognition.onresult = event => {
        let transcript = "";
        for (let i = 0; i < event.results.length; ++i) {
          transcript += event.results[i][0].transcript;
        }
        setAnswer(transcript);
      };
      recognition.onerror = () => setError("Speech recognition error.");
      recognitionRef.current = recognition;
      recognition.start();
      setRecording(true);
    } else {
      recognitionRef.current && recognitionRef.current.stop();
      setRecording(false);
    }
  };

  // Submit answer for feedback
  const handleSubmitAnswer = async () => {
    setLoading(true);
    setFeedback("");
    try {
      const fb = await getBehavioralFeedback({
        question: questions[selectedIdx],
        answer,
        role: form.target_role,
        company: form.company,
        difficulty: form.difficulty,
      });
      setFeedback(fb);
    } catch {
      setFeedback("Failed to get feedback.");
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <div>Please sign in.</div>;

  return (
    <div className="min-h-screen flex flex-col items-center py-10">
      <div className="bg-app-accent border border-app-primary rounded-xl p-8 w-full max-w-2xl shadow-lg">
        <h2 className="text-2xl font-bold text-app-primary mb-4 text-center">Behavioral Interview Prep</h2>
        <pre className="bg-app-background p-4 rounded mb-6 text-sm whitespace-pre-wrap">{instructions}</pre>
        <form className="flex flex-col gap-4 mb-6" onSubmit={handleGenerate}>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block mb-1 font-medium">Target Role</label>
              <input name="target_role" value={form.target_role} onChange={handleChange}
                className="w-full px-3 py-2 border border-app-primary rounded-lg bg-app-background" required />
            </div>
            <div className="flex-1">
              <label className="block mb-1 font-medium">Company</label>
              <input name="company" value={form.company} onChange={handleChange}
                className="w-full px-3 py-2 border border-app-primary rounded-lg bg-app-background" required />
            </div>
          </div>
          <div className="flex gap-4">
            <div>
              <label className="block mb-1 font-medium">Number of Questions</label>
              <select name="num_questions" value={form.num_questions} onChange={handleChange}
                className="px-3 py-2 border border-app-primary rounded-lg bg-app-background">
                {[...Array(10)].map((_, i) => (
                  <option key={i+1} value={i+1}>{i+1}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block mb-1 font-medium">Difficulty</label>
              <select name="difficulty" value={form.difficulty} onChange={handleChange}
                className="px-3 py-2 border border-app-primary rounded-lg bg-app-background">
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
          </div>
          <button type="submit" className="btn w-full font-semibold py-2 rounded-lg" disabled={generating}>
            {generating ? "Generating..." : "Generate Questions"}
          </button>
        </form>
        {error && <div className="text-red-600 mb-4">{error}</div>}
        {questions.length > 0 && (
          <div className="mb-6">
            <label className="block mb-1 font-medium">Select Question</label>
            <select value={selectedIdx} onChange={e => { setSelectedIdx(Number(e.target.value)); setAnswer(""); setFeedback(""); }}
              className="w-full px-3 py-2 border border-app-primary rounded-lg bg-app-background mb-2">
              {questions.map((q, i) => (
                <option key={i} value={i}>{q}</option>
              ))}
            </select>
            <div className="mb-2 p-3 bg-app-background rounded border">{questions[selectedIdx]}</div>
            <div className="flex items-center gap-2 mb-2">
              <button type="button" onClick={handleRecord}
                className={`rounded-full p-3 border border-app-primary flex items-center justify-center
                  ${recording ? "bg-app-primary text-white" : "bg-app-background text-app-primary"}`}>
                {recording ? <FaMicrophone /> : <FaMicrophoneSlash />}
              </button>
              <textarea
                value={answer}
                onChange={e => setAnswer(e.target.value)}
                className="flex-1 px-3 py-2 border border-app-primary rounded-lg bg-app-background"
                placeholder="Your answer (or use the mic)"
                rows={3}
              />
            </div>
            <button className="btn w-full font-semibold py-2 rounded-lg mb-2" onClick={handleSubmitAnswer} disabled={loading || !answer}>
              {loading ? "Getting Feedback..." : "Submit Answer"}
            </button>
            {feedback && (
              <div className="p-4 bg-app-background border border-app-primary rounded mt-2">
                <strong>Feedback:</strong>
                <div>{feedback}</div>
              </div>
            )}
            <button className="btn w-full font-semibold py-2 rounded-lg mt-4" onClick={() => window.location.href = "/"}>Done</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BehavioralPrep;