import { useEffect, useState, useRef } from "react";
import { fetchQuestionnaire } from "../services/questionnaireServices";
import { getBehavioralQuestions, getBehavioralFeedback } from "../services/behavioralPrepServices";
import { renderFeedback } from "../utils/renderFeedback.jsx";
import { uploadAudio } from "../services/audioUploadServices";
import { FaMicrophone, FaMicrophoneSlash } from "react-icons/fa";
import { GoPlay } from "react-icons/go";
import { ImStop } from "react-icons/im";

const instructionsSteps = [
  "Review your Target Role and Company (auto-filled from your questionnaire)",
  "Choose the seniority, number of questions (1-10) and difficulty",
  "Click \"Generate Questions\" to get tailored behavioral questions",
  "Select any question from the dropdown to answer",
  "Click the microphone button to start/stop recording your answer",
  "After submitting, you'll get real-time feedback for each answer",
  "You can answer as many or as few questions as you like. Click \"Done\" to finish"
];

const BehavioralPrep = ({ user }) => {
  const [form, setForm] = useState({
    target_role: "",
    company: "",
    seniority: "Junior",
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
  const [audioChunks, setAudioChunks] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioUrlRef = useRef(null);
  const audioElementRef = useRef(null);
  const localChunksRef = useRef([]);
  const mediaRecorderRef = useRef(null);

  useEffect(() => {
    const load = async () => {
      if (!user) return;

      try {
        const data = await fetchQuestionnaire(user.id);
        setForm(f => ({
          ...f,
          target_role: data.career_goal || "",
          company: (data.target_companies && data.target_companies[0]) || "",
          seniority: data.seniority || "Junior",
        }));
      } catch (err) {
        setError("Failed to fetch questionnaire data");
      }
    };
    load();
  }, [user]);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleGenerate = async e => {
    e.preventDefault();

    if (recording && mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setRecording(false);
    }

    setGenerating(true);
    setError("");
    setQuestions([]);
    setFeedback("");
    setAnswer("");
    setAudioChunks([]);
    try {
      const qs = await getBehavioralQuestions(form);
      setQuestions(qs);
      setSelectedIdx(0);
    } catch (err) {
      setError("Failed to generate questions");
    } finally {
      setGenerating(false);
    }
  };

  const handleRecord = async () => {
    if (!recording) {
      setError("");
      localChunksRef.current = [];
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

        const audioTracks = stream.getAudioTracks();
        if (!stream.active || audioTracks.length === 0) {
          setError("Microphone not ready. Please try again.");
          return;
        }

        mediaRecorderRef.current = new MediaRecorder(stream);

        mediaRecorderRef.current.ondataavailable = event => {
          localChunksRef.current.push(event.data);
        };

        mediaRecorderRef.current.onstop = () => {
          stream.getTracks().forEach(track => track.stop());

          if (localChunksRef.current.length === 0) {
            setError("No audio detected. Please try recording again.");
            setRecording(false);
            return;
          }
          const audioBlob = new Blob(localChunksRef.current, { type: "audio/webm" });
          audioUrlRef.current = URL.createObjectURL(audioBlob);
          setAudioChunks(localChunksRef.current);
          handleAudioUploadAndFeedback(audioBlob);
          setRecording(false);
        };

        mediaRecorderRef.current.start();
        setRecording(true);
      } catch {
        setError("Microphone access denied");
      }
    } else {
      mediaRecorderRef.current && mediaRecorderRef.current.stop();
    }
  };

 const handleAudioUploadAndFeedback = async (audioFile) => {
    const hasAudio = localChunksRef.current.length > 0

    if (!hasAudio) {
      setError("No audio detected. Please try recording again.");
      setRecording(false);
      return;
    }

    setLoading(true);
    setFeedback("");
    try {
      const transcript = await uploadAudio(audioFile);
      setAnswer(transcript);
      const fb = await getBehavioralFeedback({
        question: questions[selectedIdx],
        answer: transcript,
        target_role: form.target_role,
        company: form.company,
        seniority: form.seniority,
        difficulty: form.difficulty,
      });
      setFeedback(fb);
    } catch {
      setError("Failed to process audio or get feedback");
    } finally {
      setLoading(false);
    }
  };

  function formatFeedbackForSpeech(feedbackObj) {
    let data;
    try {
      data = typeof feedbackObj === "string" ? JSON.parse(feedbackObj) : feedbackObj;
    } catch {
      return typeof feedbackObj === "string" ? feedbackObj : "";
    }
    const assessment = data.overall_assessment || "";
    const suggestions = Array.isArray(data.suggestions) ? data.suggestions.join(" ") : "";
    return `${assessment}. ${suggestions}`;
  }

  const speakFeedback = (feedbackObj) => {
    if ("speechSynthesis" in window) {
      let text = "";
      if (typeof feedbackObj === "string") {
        try {
          const parsed = JSON.parse(feedbackObj);
          text = parsed.overall_assessment + ". " + (parsed.suggestions || []).join(" ");
        } catch {
          text = feedbackObj;
        }
      } else {
        text = feedbackObj.overall_assessment + ". " + (feedbackObj.suggestions || []).join(" ");
      }
      const utterance = new window.SpeechSynthesisUtterance(text);
      utterance.onstart = () => setIsPlaying(true);
      utterance.onend = () => setIsPlaying(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  function stopFeedbackSpeech() {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
    }
  }

  //Function for playing back the user's recorded audio
  const handlePlayAudio = () => {
    if (!audioUrlRef.current) return;
    if (audioElementRef.current) {
      audioElementRef.current.pause();
      audioElementRef.current.currentTime = 0;
    }
    const audio = new Audio(audioUrlRef.current);
    audio.onended = () => setIsPlaying(false);
    audioElementRef.current = audio;
    audio.play();
    setIsPlaying(true);
  };

  //Function for stopping the user's recorded audio
  const handleStopAudio = () => {
    if (audioElementRef.current) {
      audioElementRef.current.pause();
      audioElementRef.current.currentTime = 0;
    }
    setIsPlaying(false);
  };

  const handleSubmitAnswer = async () => {
    setLoading(true);
    setFeedback("");
    try {
      const fb = await getBehavioralFeedback({
        question: questions[selectedIdx],
        answer,
        target_role: form.target_role,
        company: form.company,
        seniority: form.seniority,
        difficulty: form.difficulty,
      });
      setFeedback(fb);
    } catch {
      setFeedback("Failed to get feedback");
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <div>Please sign in.</div>;

  return (
    <div className="min-h-screen flex flex-col items-center py-10">
      <div className="bg-app-accent border border-app-primary rounded-xl p-8 w-full max-w-2xl shadow-lg">
        <h2 className="text-2xl font-bold text-app-primary mb-4 text-center">Behavioral Interview Prep</h2>
        <ul className="bg-app-background p-4 rounded mb-6 text-sm">
          {instructionsSteps.map((step, idx) => (
            <li key={idx} className="mb-1">{idx + 1}. {step}</li>
          ))}
        </ul>
        <form className="flex flex-col gap-6 mb-8" onSubmit={handleGenerate}>
          <div className="flex gap-6">
            <div className="flex-1 min-w-[160px]">
              <label className="block mb-2 font-medium">Target Role</label>
              <input
                name="target_role"
                value={form.target_role}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-app-primary rounded-lg bg-app-background text-base resize-vertical"
                rows={2}
                required
              />
            </div>
            <div className="flex-1 min-w-[160px]">
              <label className="block mb-2 font-medium">Company</label>
              <input
                name="company"
                value={form.company}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-app-primary rounded-lg bg-app-background text-base resize-vertical"
                rows={2}
                required
              />
            </div>
          </div>
          <div className="flex gap-6">
            <div className="min-w-[160px] flex-1">
              <label className="block mb-2 font-medium ">Seniority</label>
              <select name="seniority" value={form.seniority} onChange={handleChange}
                className="w-full px-4 py-3 border border-app-primary rounded-lg bg-app-background text-base cursor-pointer">
                <option value="Intern">Intern</option>
                <option value="Junior">Junior</option>
                <option value="Mid">Mid</option>
                <option value="Senior">Senior</option>
                <option value="Lead">Lead</option>
                <option value="Manager">Manager</option>
              </select>
            </div>
            <div className="min-w-[160px] flex-1">
              <label className="block mb-2 font-medium">Number of Questions</label>
              <select name="num_questions" value={form.num_questions} onChange={handleChange}
                className="w-full px-4 py-3 border border-app-primary rounded-lg bg-app-background text-base cursor-pointer">
                {[...Array(10)].map((_, i) => (
                  <option key={i+1} value={i+1}>{i+1}</option>
                ))}
              </select>
            </div>
            <div className="min-w-[160px] flex-1">
              <label className="block mb-2 font-medium">Difficulty</label>
              <select name="difficulty" value={form.difficulty} onChange={handleChange}
                className="w-full px-4 py-3 border border-app-primary rounded-lg bg-app-background text-base cursor-pointer">
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
          </div>
          <button
            type="submit"
            className={`btn-primary w-full h-12 text-lg font-semibold py-2 rounded-lg flex items-center justify-center cursor-pointer
              ${generating ? "bg-app-secondary opacity-60 cursor-not-allowed" : ""}`}
            disabled={generating}
          >
            {generating && <div className="loader-md mr-2"></div>}
            {generating ? "Generating..." : "Generate Questions"}
          </button>
        </form>

        {error && <div className="text-red-600 mb-4">{error}</div>}

        {questions.length > 0 && (
          <div className="mb-6">
            <label className="font-medium min-w-[120px]">Select Question:</label>
            <select
              value={selectedIdx}
              onChange={e => { setSelectedIdx(Number(e.target.value)); setAnswer(""); setFeedback(""); }}
              className="flex-1 px-1 py-1 ml-1 mb-2 border border-app-primary rounded-lg bg-app-background cursor-pointer"
            >
              {questions.map((q, i) => (
                <option key={i} value={i}>{`Q${i + 1}`}</option>
              ))}
            </select>
            <div className="mb-2 p-3 bg-app-background rounded border">{questions[selectedIdx]}</div>
            <div className="flex items-center gap-2 mt-4 mb-2">
              <button type="button" onClick={handleRecord}
                className={`rounded-full p-3 border border-app-primary flex items-center justify-center cursor-pointer
                  ${recording ? "bg-app-background text-app-primary" : "bg-app-background text-app-primary"}`}>
                {recording ? <FaMicrophone /> : <FaMicrophoneSlash />}
              </button>
              <textarea
                value={answer}
                onChange={e => setAnswer(e.target.value)}
                onInput={e => {
                  e.target.style.height = "auto";
                  e.target.style.height = `${e.target.scrollHeight}px`;
                }}
                className="flex-1 px-3 py-2 border border-app-primary rounded-lg bg-app-background"
                placeholder="Your answer (or use the mic)"
                rows={3}
              />
            </div>
            {loading && <div className="loader mb-4"></div>}
            <button className={`btn w-full h-12 text-lg font-semibold py-2 rounded-lg mt-3 mb-4 flex items-center justify-center cursor-pointer
              ${loading ? "bg-app-secondary opacity-60 cursor-not-allowed" : ""}`}
              onClick={handleSubmitAnswer}
              disabled={loading || !answer}
            >
              {loading && <div className="loader-md mr-2"></div>}
              {loading ? "Getting Feedback..." : "Submit Answer"}
            </button>
            {feedback && (
              <div className="p-4 bg-app-background border border-app-primary rounded">
                <strong>Feedback:</strong>
                {renderFeedback(feedback)}
                <div className="flex gap-2 mt-2">
                  <button
                    className="px-4 py-2 rounded-lg font-semibold flex items-center gap-2 btn-primary cursor-pointer"
                    onClick={() => speakFeedback(formatFeedbackForSpeech(feedback))}
                    type="button"
                    disabled={isPlaying}
                  >
                    <span role="img" aria-label="Play">
                      <GoPlay/>
                    </span> Play Feedback
                  </button>
                  <button
                    className="px-4 py-2 rounded-lg font-semibold flex items-center gap-2 btn-danger cursor-pointer"
                    onClick={stopFeedbackSpeech}
                    type="button"
                    disabled={!isPlaying}
                  >
                    <span role="img" aria-label="Stop">
                      <ImStop/>
                    </span> Stop Feedback
                  </button>
                </div>
              </div>
            )}
            <button className="btn w-full h-12 text-lg font-semibold py-2 rounded-lg mt-3 cursor-pointer" onClick={() => window.location.href = "/"}>Done</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BehavioralPrep;