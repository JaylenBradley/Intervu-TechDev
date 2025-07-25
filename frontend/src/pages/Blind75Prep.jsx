import React, { useState, useEffect } from "react";
import {
  DndContext, PointerSensor, useSensor, useSensors, closestCenter,
} from "@dnd-kit/core";
import {
  SortableContext, arrayMove, verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import PracticePanel from "../components/PracticePanel";
import CodePanel     from "../components/CodePanel";
import {
  toLines, MAX_INDENT, INDENT_WIDTH, diffClasses,
} from "../utils/constants";
import ConfigBlind75 from "../components/Config_Blind75";
import { CSS } from "@dnd-kit/utilities";
import { useNotification } from "../components/NotificationProvider";


function useLocalStorage(key, fallback) {
  const [value, setValue] = useState(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  });

  const persist = (next) => {
    setValue(next);
    localStorage.setItem(key, JSON.stringify(next));
  };

  return [value, persist];
}

export default function Blind75Prep({ userId }) {
  const [savedCfg, saveCfg] = useLocalStorage("blind75-settings", {
    evaluationMode : false,
    elimMode       : "none",
    elimCount      : 1,
  });

  /* ── per‑session / runtime copy ──────────────────────── */
  const [evaluationMode, setEvaluationMode] = useState(savedCfg.evaluationMode);
  const [elimMode,       setElimMode]       = useState(savedCfg.elimMode);
  const [elimCount,      setElimCount]      = useState(savedCfg.elimCount);

  /* ── ui state ────────────────────────────────────────── */
  const [showConfig , setShowConfig ] = useState(false);
  const [uiStep     , setUiStep     ] = useState("config");
  const [numQuestions, setNumQuestions] = useState(3);
  const [questions    , setQuestions    ] = useState([]);
  const [current      , setCurrent      ] = useState(0);
  const [showCode     , setShowCode     ] = useState(false);

  /* ── per‑question state ─────────────────── */
  const [statusLines , setStatusLines ] = useState(null);
  const [statusCx    , setStatusCx    ] = useState(null);
  const [statusA     , setStatusA     ] = useState(null);
  const [wrongDetail , setWrongDetail ] = useState(null);
  const [timeSel     , setTimeSel     ] = useState("");
  const [spaceSel    , setSpaceSel    ] = useState("");
  const [approachSel , setApproachSel ] = useState("");
  const [wrongLineIds, setWrongLineIds] = useState(new Set());
  const [codeAnswer  , setCodeAnswer  ] = useState("");
  const [codeLoading , setCodeLoading ] = useState(false);
  const [codeFeedback, setCodeFeedback] = useState(null);
  const [hintText    , setHintText    ] = useState("");
  const [hintLoading , setHintLoading ] = useState(false);
  const [explain, setExplain] = useState({
  approach   : { text: "", loading: false },
  complexity : { text: "", loading: false },
  indent     : { text: "", loading: false },
});

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

  const resetStatus = () => {
    setStatusLines(null);
    setStatusCx(null);
    setStatusA(null);
    setTimeSel("");
    setSpaceSel("");
    setApproachSel("");
    setWrongLineIds(new Set());
    setWrongDetail(null);
    setCodeAnswer("");
    setCodeFeedback(null);
    setHintText("");
    setExplain({
    approach   : { text: "", loading: false },
    complexity : { text: "", loading: false },
    indent     : { text: "", loading: false },
  });
  };

  /* ── navigation helpers ─────────────────────────────── */
  const scrollToTop = () =>
  window.scrollTo({ top: 0, behavior: "smooth" }); 

  

  const next = () => {
    if (!showCode && evaluationMode) { setShowCode(true); scrollToTop(); return; }
    if (current < questions.length - 1) {
      setCurrent((c) => c + 1);
      setShowCode(false);
      resetStatus();
      scrollToTop();

    }
  };

  const skip = () => {
    if (!showCode && evaluationMode) { setShowCode(true); scrollToTop(); return; }
    if (current < questions.length - 1) {
      setCurrent((c) => c + 1);
      setShowCode(false);
      resetStatus();
      scrollToTop();

    }
  };

  /* ── load questions ─────────────────────────────────── */
  const startQuiz = async () => {
    setUiStep("loading");
    try {
      const BASE = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";
      const fetchOne = async () => {
        const r = await fetch(`${BASE}/api/blind75/random`);
        if (!r.ok) throw new Error("Bad response");
        return r.json();
      };
      const data = await Promise.all(Array.from({ length: numQuestions }, fetchOne));
      setQuestions(
        data.map((p) => ({
          ...p,
          lines        : toLines(p),
          codeDone     : false,
          plainSolution: p.solution.map((l) => "    ".repeat(l.indentLevel) + l.text.trimStart()),
        })),
      );
      setCurrent(0);
      resetStatus();
      setUiStep("quiz");
    } catch (err) {
      console.error(err);
      showNotification("Failed to load problems", "error");
      setUiStep("config");
    }
  };

  const fetchHint = async () => {
  setHintLoading(true);
  setHintText("");
  try {
    const BASE = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";
    const res  = await fetch(`${BASE}/api/interview/technical/hint`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        question:       questions[current].prompt,      
        user_answer:    codeAnswer || "(no answer yet)",
        target_company: "generic",
        difficulty:     questions[current].difficulty.toLowerCase(),
      }),
    });
    if (!res.ok) throw new Error("bad response");
    const data = await res.json();         
    setHintText(data.hint || "No hint returned.");
  } catch (e) {
    console.log(e)
    setHintText("Could not fetch hint. Please try again.");
  } finally {
    setHintLoading(false);
  }
};

const fetchExplanation = async (answerType) => {
  setExplain((prev) => ({
    ...prev,
    [answerType]: { text: "", loading: true },
  }));

  try {
    const BASE = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";
    const q    = questions[current];      

    let correctAnswer;
    if (answerType === "complexity") {
      correctAnswer = `${q.time}, ${q.space}`;          
    } else if (answerType === "approach") {
      correctAnswer = q.type;                        
    } else {
      correctAnswer = q.plainSolution.join("\n");      
    }

    const res = await fetch(`${BASE}/api/interview/technical/explanation`, {
      method : "POST",
      headers: { "Content-Type": "application/json" },
      body   : JSON.stringify({
        question       : q.prompt,
        answer_type    : answerType,
        correct_answer : correctAnswer,
        difficulty     : q.difficulty.toLowerCase(),
        target_company : "generic",
      }),
    });
    if (!res.ok) throw new Error("bad response");

    const { explanation } = await res.json();

    setExplain((prev) => ({
      ...prev,
      [answerType]: { text: explanation || "No explanation returned.", loading: false },
    }));
  } catch (e) {
    console.error(e);
    setExplain((prev) => ({
      ...prev,
      [answerType]: { text: "Could not fetch explanation. Please try again.", loading: false },
    }));
  }
};


  const currentLines =
    uiStep === "quiz" ? questions[current]?.lines ?? [] : [];

  const updateLines = (lines) =>
    setQuestions((qs) => {
      const cp = [...qs];
      cp[current] = { ...cp[current], lines };
      return cp;
    });

  /* drag handling */
  const handleDragStart = () => {
    setWrongLineIds(new Set());
    setStatusLines(null);
  };

  const handleDragEnd = ({ active, over, delta }) => {
    if (!active || !over) return;
    let lines = [...currentLines];
    if (active.id !== over.id) {
      const oldIdx = lines.findIndex((l) => l.id === active.id);
      const newIdx = lines.findIndex((l) => l.id === over.id);
      lines = arrayMove(lines, oldIdx, newIdx);
    }
    const startIndent = active.data.current?.indent ?? 0;
    const newIndent = Math.max(
      0,
      Math.min(MAX_INDENT, startIndent + Math.round(delta.x / INDENT_WIDTH))
    );
    lines = lines.map((l) =>
      l.id === active.id ? { ...l, userIndent: newIndent } : l
    );
    updateLines(lines);
  };

  /* code order + indent check */
  const checkLines = async () => {
      let indentWrong = false;
  let orderWrong  = false;

  currentLines.forEach((l, idx) => {
    if (l.userIndent !== l.indentLevel) indentWrong = true;
    if (l.order       !== idx)          orderWrong  = true;
  });

  if (!indentWrong && !orderWrong) {
    setStatusLines("correct");
    setWrongDetail(null);
    setWrongLineIds(new Set());
    return;
  }

  setStatusLines("incorrect");
  setWrongDetail(
    indentWrong && orderWrong ? "both" : indentWrong ? "indent" : "order"
  );
  setWrongLineIds(
    new Set(
      currentLines
        .filter((l, idx) => l.userIndent !== l.indentLevel || l.order !== idx)
        .map((l) => l.id)
    )
  );}

 const checkComplexities = () => {
  const q = questions[current];

  const timeOK  = timeSel  === q.time;
  const spaceOK = spaceSel === q.space;

  if (timeOK && spaceOK)          setStatusCx("correct");
  else if (!timeOK &&  spaceOK)   setStatusCx("time");
  else if ( timeOK && !spaceOK)   setStatusCx("space");
  else                            setStatusCx("both");
};


  const checkApproach = () => {
    const q = questions[current];
    const good = approachSel === q.type;
    setStatusA(good ? "correct" : "incorrect");
  };

  const shuffleCurrent = () => {
    updateLines([...currentLines].sort(() => Math.random() - 0.5));
    setStatusLines(null);
    setWrongLineIds(new Set());
  };



const canAdvance = () => {
  if (!showCode) {
    return (
      statusLines === "correct" &&  
      statusCx    === "correct" &&  
      statusA     === "correct"     
    );
  }

  return (
    !evaluationMode ||
    questions[current]?.codeDone === true
  );
};

 const buildEliminatedCode = (type) => {
  const SAFE_LINES = 2;                               // keep first 2 lines
  const arr = [...questions[current].plainSolution];

// Off → return ONLY the first two lines
  if (type === "none") {
      return arr.slice(0, SAFE_LINES).join("\n");
  }

  /* Random N / Last N logic (unchanged) */
  const n = Math.min(elimCount, arr.length - SAFE_LINES);

  if (type === "last") {
    for (let i = 0; i < n; i++) {
      const idx = arr.length - 1 - i;
      if (idx >= SAFE_LINES) arr[idx] = "# Type answer here";
    }
  } else { // "random"
    const idxs = new Set();
    while (idxs.size < n) {
      idxs.add(
        SAFE_LINES + Math.floor(Math.random() * (arr.length - SAFE_LINES))
      );
    }
    idxs.forEach((i) => (arr[i] = "# Type answer here"));
  }

  return arr.join("\n");
};

useEffect(() => {
  if (!showCode) return;

  setCodeAnswer(prev => {
    if (prev.trim() !== "") return prev;       
    return buildEliminatedCode(elimMode);
  });
}, [showCode, current, elimMode, elimCount]);


const submitCode = async () => {
  if (!codeAnswer.trim()) return;

  setCodeLoading(true);
  try {
    const BASE = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";
    const res  = await fetch(`${BASE}/api/interview/technical/evaluate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
      question_id: "1",
      question: questions[current].prompt,
      user_answer: codeAnswer,
      target_company: "generic",
      difficulty: questions[current].difficulty.toLowerCase()
      }),
    });
    if (!res.ok) throw new Error("bad response");
    const data = await res.json();           
    setCodeFeedback(data);
    setQuestions((qs) => {
      const cp = [...qs];
      cp[current] = { ...cp[current], codeDone: true };
      return cp;
    });
  } catch (err) {
    showNotification("Evaluation failed. Try again.", "error");
  } finally {
    setCodeLoading(false);
  }
};

const totalSteps = evaluationMode ? questions.length * 2    
                                  : questions.length;        
const stepIndex  = evaluationMode
  ? (showCode ? current * 2 + 1 : current * 2)  
  :  current;                                   

const percent = Math.round(((stepIndex + 1) / totalSteps) * 100);

const header = (
  <div className="bg-white rounded-xl shadow-lg p-6">
    <div className="flex justify-between items-center mb-2 flex-wrap">
      <h1 className="text-2xl font-bold text-app-primary">
        {showCode ? "Write your solution" : "Blind 75 Prep"}
      </h1>
      <span className="text-sm text-app-text">
        Question {current + 1} of {questions.length}
      </span>
    </div>
    <div className="w-full bg-gray-200 rounded-full h-2">
      <div
        className="bg-app-primary h-2 rounded-full transition-[width] duration-500 ease-out"
        style={{ width: `${percent}%` }}
      />
    </div>
  </div>
);

  const handleSaveCfg = () => {
    saveCfg({ evaluationMode, elimMode, elimCount });   
    setShowConfig(false);
  };
  const handleCancelCfg = () => {
    setEvaluationMode(savedCfg.evaluationMode);
    setElimMode(savedCfg.elimMode);
    setElimCount(savedCfg.elimCount);
    setShowConfig(false);
  };

useEffect(() => {
  const { elimMode: dMode, elimCount: dCount } = savedCfg;
  setElimMode(dMode);
  setElimCount(dCount);
}, [current, savedCfg]);   

  /* ====== MAIN RENDER ====== */
  if (uiStep === "config") {
  return (
    <ConfigBlind75
      /* lift state down */
      showConfig={showConfig}       setShowConfig={setShowConfig}
      numQuestions={numQuestions}   setNumQuestions={setNumQuestions}
      evaluationMode={evaluationMode} setEvaluationMode={setEvaluationMode}
      elimMode={elimMode}           setElimMode={setElimMode}
      elimCount={elimCount}         setElimCount={setElimCount}

      /* callbacks */
      startQuiz={startQuiz}
      handleSaveCfg={handleSaveCfg}
      handleCancelCfg={handleCancelCfg}
    />
  );
}


  if (uiStep === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center py-16">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-app-primary mx-auto mb-4" />
          <p className="text-app-text">Loading problems…</p>
        </div>
      </div>
    );
  }

  if (uiStep === "quiz") {
    const q = questions[current];
    const atLastQ = current === questions.length - 1;
    const problem = (
      <div className="bg-white rounded-xl shadow-lg p-6 overflow-hidden">
        <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
          <h2 className="text-xl font-semibold text-app-primary truncate">
            {q.title}
          </h2>

          <div className="flex gap-2 items-center flex-wrap">
            <span
              className={`px-3 py-1 rounded-full text-sm ${
                diffClasses[q.difficulty] || "bg-gray-100 text-gray-800"
              }`}
            >
              {q.difficulty}
            </span>           
          </div>
        </div>

        {q.prompt && (
          <p className="text-sm text-gray-700 mb-4 whitespace-pre-wrap">
            {q.prompt}
          </p>
        )}
      </div>
    );
  

return (
  <div className="min-h-screen py-10">
    <div className="max-w-4xl mx-auto space-y-6 px-4">
      {header}
      {problem}
      

      {showCode ? (
        <CodePanel
          question={questions[current]}
          codeAnswer={codeAnswer}
          setCodeAnswer={setCodeAnswer}
          codeLoading={codeLoading}
          onSubmit={submitCode}
          fetchHint={fetchHint}
          hintLoading={hintLoading}
          hintText={hintText}
          codeFeedback={codeFeedback}
          elimMode={elimMode}
          setElimMode={setElimMode}
          elimCount={elimCount}
          setElimCount={setElimCount}
          buildEliminatedCode={buildEliminatedCode}

          next={next}
          skip={skip}
          canAdvance={canAdvance()}
          atLastQ={current === questions.length - 1}
        />
      ) : (
        <PracticePanel
          question={{ ...questions[current], index: current }}

          /* approach */
          approachSel={approachSel}
          setApproachSel={setApproachSel}
          statusA={statusA}
          checkApproach={checkApproach}

          /* reorder */
          sensors={sensors}
          currentLines={currentLines}
          handleDragStart={handleDragStart}
          handleDragEnd={handleDragEnd}
          fetchExplanation={fetchExplanation}
          wrongLineIds={wrongLineIds}
          statusLines={statusLines}
          wrongDetail={wrongDetail}
          checkLines={checkLines}
          shuffleCurrent={shuffleCurrent}

          /* complexities */
          timeSel={timeSel}
          setTimeSel={setTimeSel}
          spaceSel={spaceSel}
          setSpaceSel={setSpaceSel}
          statusCx={statusCx}
          checkComplexities={checkComplexities}

          explain={explain} 

          next={next}
          skip={skip}
          canAdvance={canAdvance()}
          atLastQ={current === questions.length - 1}
        />
      )}

        {/* ───────────── bottom navigation ───────────── */}
      <div className="flex justify-end gap-2">
        <button
          onClick={skip}
          disabled={atLastQ && showCode}
          className="btn-primary w-full py-2 rounded-lg font-semibold"
        >
          Skip →
        </button>
        <button
          onClick={next}
          disabled={!canAdvance()}
          className="btn-primary w-full py-2 rounded-lg font-semibold"
        >
          Next →
        </button>
      </div>
    </div>
  </div>
);
}
return null;
}