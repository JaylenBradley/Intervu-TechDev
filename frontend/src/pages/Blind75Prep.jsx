import React, { useState } from "react";
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import CodeMirror from "@uiw/react-codemirror";
import { python } from "@codemirror/lang-python";


/*Constants and helpers*/
const INDENT_WIDTH = 48;
const MAX_INDENT = 4;
const COMPLEXITIES = [
  "O(1)",
  "O(log n)",
  "O(n)",
  "O(n log n)",
  "O(n^2)",
  "O(n^3)",
  "O(2^n)",
  "O(n!)",
];
const APPROACHES = [
  "Two Pointers", "Sliding Window", "Binary Search",
  "BFS", "Dynamic Programming", "Backtracking", "Tree",
  "Greedy", "Topological Sort", "Graph",
  "Heap", "Stack", "Intervals", "Linked List", "Array & Hashing",
];
const diffClasses = {
  Easy: "bg-green-100 text-green-800",
  Medium: "bg-yellow-100 text-yellow-800",
  Hard: "bg-red-100 text-red-800",
};
const genId = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);


export function toLines(problem) {
  return problem.solution
    .map((l, idx) => ({
      id: genId(),
      order: idx,
      text: l.text.trimStart(),
      indentLevel: l.indentLevel,
    }))
    .sort(() => Math.random() - 0.5);
}

const isLineCorrect = (line, idx) =>
  line.userIndent === line.indentLevel && line.order === idx;

/* Sortable line component */
function SortableLine({ line, isWrong, highlightCorrect }) {
  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: line.id, data: { indent: line.userIndent } });

  const left = line.userIndent * INDENT_WIDTH;
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    marginLeft: left,
    width: `calc(100% - ${left}px)`,
    opacity: isDragging ? 0.7 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={style}
      className={`flex items-center rounded p-2 cursor-grab select-none ${
        highlightCorrect ? "bg-green-100" : isWrong ? "bg-red-200" : "bg-gray-100"
      }`}
    >
      <pre
        className="font-mono text-sm whitespace-pre overflow-x-auto"
        style={{ tabSize: 4 }}
      >
        {line.text}
      </pre>
    </div>
  );
}

/* Main component */
export default function Blind75Prep({ userId }) {
  /* state */
  const [step, setStep] = useState("config");
  const [numQuestions, setNumQuestions] = useState(3);
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [statusLines, setStatusLines] = useState(null);
  const [statusCx, setStatusCx] = useState(null);
  const [statusA, setStatusA] = useState(null);
  const [wrongDetail, setWrongDetail] = useState(null); 
  const [timeSel, setTimeSel] = useState("");
  const [spaceSel, setSpaceSel] = useState("");
  const [approachSel, setApproachSel] = useState("");
  const [wrongLineIds, setWrongLineIds] = useState(new Set());
  const [evaluationMode, setEvaluationMode] = useState(false);   
  const [codeMode,      setCodeMode]      = useState(false);     
  const [codeAnswer,    setCodeAnswer]    = useState("");
  const [codeLoading,   setCodeLoading]   = useState(false);
  const [codeFeedback,  setCodeFeedback]  = useState(null);  
  const [elimCount, setElimCount] = useState(1); 
  const [elimMode,  setElimMode]  = useState("none");  

  /* sensors */
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } })
  );

  /* helper to reset status for a new question */
  const resetStatus = () => {
    setStatusLines(null);
    setStatusCx(null);
    setStatusA(null);
    setTimeSel("");
    setSpaceSel("");
    setApproachSel("");
    setWrongLineIds(new Set());
    setWrongDetail(null); 
  };

  /* fetch quiz questions */
  const startQuiz = async () => {
    setStep("loading");
    try {
      const BASE = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";
      const fetchOne = async () => {
        const r = await fetch(`${BASE}/api/blind75/random`);
        if (!r.ok) throw new Error("Bad response");
        return r.json();
      };
      const data = await Promise.all(
        Array.from({ length: numQuestions }, fetchOne)
      );
setQuestions(
  data.map((p) => ({
    ...p,
    lines: toLines(p),
    codeDone: false,
    plainSolution: p.solution.map(
      (l) => "    ".repeat(l.indentLevel) + l.text.trimStart()
    ),
  }))
);
      setCurrent(0);
      resetStatus();
      setStep("quiz");
    } catch (e) {
      console.error(e);
      alert("Failed to load problems");
      setStep("config");
    }
  };


  /* derived helpers */
  const currentLines =
    step === "quiz" ? questions[current]?.lines ?? [] : [];

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
  );
    /* POST /wrong */
    if (!userId) {
      console.warn("No userId – skipping /wrong submission");
      return;
    }
    try {
      const BASE = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";
      await fetch(`${BASE}/api/blind75/wrong`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          title: questions[current].title,
          problem_type: questions[current].type,
          difficulty: questions[current].difficulty,
        }),
      });
    } catch (err) {
      console.error("Failed to record wrong problem", err);
    }
  };

  /* complexity check */
  const checkComplexities = () => {
    const q = questions[current];
    const good = timeSel === q.time && spaceSel === q.space;
    setStatusCx(good ? "correct" : "incorrect");
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

  const handleTab = (e) => {
  if (e.key === "Tab") {
    e.preventDefault();
    const start = e.target.selectionStart;
    const end   = e.target.selectionEnd;
    const newVal =
      codeAnswer.slice(0, start) + "    " + codeAnswer.slice(end);
    setCodeAnswer(newVal);
    setTimeout(() => {
      e.target.selectionStart = e.target.selectionEnd = start + 4;
    });
  }
};

 const move = (dir) => {
  /*  handle back from code view  */
  if (dir === -1 && codeMode) {
    setCodeMode(false);
    return;
  }

  /*  going forward  */
  if (dir === 1 && evaluationMode && !codeMode && !questions[current].codeDone) {
    setCodeMode(true);
    setCodeAnswer("");
    let initial = "";
    if (elimMode === "random") initial = buildEliminatedCode("random");
    if (elimMode === "last")   initial = buildEliminatedCode("last");
    setCodeAnswer(initial);
    setCodeFeedback(null);
    return;
  }

  /*  regular pagination  */
  const atFirst = current === 0;
  const atLast  = current === questions.length - 1;
  if ((dir === -1 && atFirst) || (dir === 1 && atLast)) return;

  setCurrent((c) => c + dir);
  setCodeMode(false);
  resetStatus();
};

const buildEliminatedCode = (type) => {
  const linesArr = [...questions[current].plainSolution];  

  const n = Math.min(elimCount, linesArr.length);

  if (type === "last") {
    for (let i = 0; i < n; i++) {
      linesArr[linesArr.length - 1 - i] = "# ???";
    }
  } else {                         
    const idxs = new Set();
    while (idxs.size < n) idxs.add(Math.floor(Math.random() * linesArr.length));
    idxs.forEach((i) => (linesArr[i] = "# ???"));
  }

  return linesArr.join("\n");
};

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
    alert("Evaluation failed. Try again.");
  } finally {
    setCodeLoading(false);
  }
};


  /* UI steps */
    if (codeMode) {
  const q = questions[current];
  return (
    <div className="min-h-screen bg-app-background py-10">
      <div className="max-w-4xl mx-auto space-y-6 px-4">
        {/* header */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-2 flex-wrap">
            <h1 className="text-2xl font-bold text-app-primary">
              Write your solution
            </h1>
          </div>
        </div>

        {/* problem card */}
        <div className="bg-white rounded-xl shadow-lg p-6 overflow-hidden">
          <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
            <h2 className="text-xl font-semibold text-app-primary mr-4 truncate">
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

        {/* code editor */}
<div className="bg-white rounded-xl shadow-lg p-6 space-y-4">
  <CodeMirror
    value={codeAnswer}
    height="240px"
    basicSetup={{
      lineNumbers: true,
      highlightActiveLine: false,
      indentWithTab: true,
    }}
    extensions={[python()]}
    onChange={(val) => setCodeAnswer(val)}
    theme="light"
    className="border border-app-primary rounded-lg"
  />

          <div className="flex gap-4 mt-4">
            <button
              onClick={submitCode}
              disabled={codeLoading || !codeAnswer.trim()}
              className="bg-app-primary text-white px-6 py-2 rounded-lg font-semibold hover:bg-opacity-90 disabled:opacity-50"
            >
              {codeLoading ? "Evaluating…" : "Submit"}
            </button>
            <button
              onClick={() => move(-1)}
              className="bg-gray-400 text-white px-6 py-2 rounded-lg font-semibold hover:bg-opacity-90"
            >
              ← Back
            </button>
            {codeFeedback && (
              <button
                onClick={() => move(1)}
                className="bg-gray-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-opacity-90"
              >
                Next →
              </button>
            )}
          </div>

          {/* feedback */}
          {codeFeedback && (
            <div className="mt-6 space-y-3">
              <div>
                <span className="font-medium">Score:</span>{" "}
                <span className="font-bold">
                  {codeFeedback.score?.toFixed(1)}/100
                </span>
              </div>
              <pre className="bg-gray-50 p-4 rounded-lg whitespace-pre-wrap">
                {codeFeedback.feedback}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
  if (step === "config") {
    return (
       <div className="min-h-screen flex items-center justify-center bg-app-background py-16">
    <div className="bg-white shadow-xl rounded-2xl w-full max-w-lg p-10">
      {/* title */}
      <h1 className="text-center text-3xl font-extrabold text-app-primary mb-8">
        Blind&nbsp;75 Reorder Prep
      </h1>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          startQuiz();
        }}
        className="space-y-6"
      >
        {/* Question count – dropdown (original style) */}
        <div>
          <label className="block mb-1 font-medium text-app-text">
            Number of Questions
          </label>
          <select
            value={numQuestions}
            onChange={(e) => setNumQuestions(parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-app-primary rounded-lg focus:outline-none bg-app-background text-app-text"
          >
            <option value={3}>3</option>
            <option value={5}>5</option>
            <option value={10}>10</option>
          </select>
        </div>

        {/* Evaluation‑mode toggle */}
        <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg p-3">
          <label htmlFor="evalMode" className="font-medium text-app-text">
            Evaluation mode
            <br />
            <span className="text-xs text-gray-500">
              (write code after each reorder)
            </span>
          </label>

          {/* fancy switch */}
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              id="evalMode"
              type="checkbox"
              checked={evaluationMode}
              onChange={(e) => setEvaluationMode(e.target.checked)}
              className="sr-only peer"
            />
            <div
              className="w-11 h-6 bg-gray-300 rounded-full
                         peer-focus:outline-none
                         peer-checked:bg-app-primary
                         after:absolute after:start-1 after:top-1 after:bg-white
                         after:h-4 after:w-4 after:rounded-full after:transition-all
                         peer-checked:after:translate-x-full"
            />
          </label>
        </div>

        {/* Auto‑blank lines */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <label className="block font-medium text-app-text mb-2">
            Auto‑blank lines in solution
          </label>
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={elimMode}
              onChange={(e) => setElimMode(e.target.value)}
              className="px-3 py-2 border rounded-lg bg-white text-app-text focus:outline-none"
            >
              <option value="none">Off</option>
              <option value="random">Random N</option>
              <option value="last">Last N</option>
            </select>

            <input
              type="number"
              min={1}
              max={99}
              disabled={elimMode === "none"}
              value={elimCount}
              onChange={(e) => setElimCount(e.target.value)} 
              className="w-20 px-3 py-2 border rounded-lg bg-white text-app-text
                         focus:outline-none disabled:opacity-50"
            />
            <span className="text-sm text-gray-500">lines</span>
          </div>
        </div>

        {/* Start button */}
        <button
          type="submit"
          className="btn-primary px-6 py-2 rounded-lg font-semibold cursor-pointer w-full"
        >
          Start Practice
        </button>
      </form>
    </div>
  </div>
    );
  }

  if (step === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-app-background py-16">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-app-primary mx-auto mb-4" />
          <p className="text-app-text">Loading problems…</p>
        </div>
      </div>
    );
  }

  /* Quiz step */
  const q = questions[current];
  const percent = Math.round(((current + 1) / questions.length) * 100);

  return (
    <div className="min-h-screen bg-app-background py-10">
      <div className="max-w-4xl mx-auto space-y-6 px-4">
        {/* header */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-2 flex-wrap">
            <h1 className="text-2xl font-bold text-app-primary">Blind 75 Prep</h1>
            <span className="text-sm text-app-text">
              Question {current + 1} of {questions.length}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-app-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${percent}%` }}
            />
          </div>
          <div className="flex justify-end text-xs text-gray-500 mt-1">
            <span>{percent}% Complete</span>
          </div>
        </div>

        {/* problem card */}
        <div className="bg-white rounded-xl shadow-lg p-6 overflow-hidden">
          <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
            <h2 className="text-xl font-semibold text-app-primary mr-4 truncate">
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
              <button
                onClick={() => move(-1)}
                disabled={current === 0}
                className="px-3 py-1 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300 disabled:opacity-50"
              >
                ← Previous
              </button>
              <button
                onClick={() => move(1)}
                disabled={current === questions.length - 1}
                className="px-3 py-1 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300 disabled:opacity-50"
              >
                Next →
              </button>
            </div>
          </div>

          {q.prompt && (
            <p className="text-sm text-gray-700 mb-4 whitespace-pre-wrap">
              {q.prompt}
            </p>
          )}
        </div>

        {/* approach card */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-app-primary mb-4">
            Select Approach
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 text-sm font-medium">
                Type of problem
              </label>
              <select
                value={approachSel}
                onChange={(e) => setApproachSel(e.target.value)}
                className="w-full px-3 py-2 border border-app-primary rounded-lg focus:outline-none bg-app-background text-app-text"
              >
                <option value="">-- select --</option>
                {APPROACHES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
           
          </div>

          <div className="flex flex-wrap mt-4 gap-4">
            <button
              onClick={checkApproach}
              className="bg-app-primary text-white px-6 py-2 rounded-lg font-semibold hover:bg-opacity-90"
            >
              Check Approach
            </button>
            {statusA === "correct" && (
              <span className="self-center text-sm font-medium text-green-600">
                ✔ Correct
              </span>
            )}
            {statusA === "incorrect" && (
              <span className="self-center text-sm font-medium text-red-600">
                ✖ Try again
              </span>
            )}
          </div>
        </div>

        {/* problem card */}
        <div className="bg-white rounded-xl shadow-lg p-6 overflow-hidden">
          <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
            <h2 className="text-xl font-semibold text-app-primary mr-4 truncate">
              Order & Indent Code
            </h2>
          </div>

          {q.prompt && (
            <p className="text-sm text-gray-700 mb-4 whitespace-pre-wrap">
              {q.prompt}
            </p>
          )}

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={currentLines}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2 mb-6">
                {currentLines.map((l) => (
                  <SortableLine
                    key={l.id}
                    line={l}
                    isWrong={wrongLineIds.has(l.id)}
                    highlightCorrect={statusLines === "correct"}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>

          <div className="flex flex-wrap gap-4">
            <button
              onClick={checkLines}
              className="bg-app-primary text-white px-6 py-2 rounded-lg font-semibold hover:bg-opacity-90"
            >
              Check Code
            </button>
            <button
              onClick={shuffleCurrent}
              className="bg-gray-400 text-white px-6 py-2 rounded-lg font-semibold hover:bg-opacity-90"
            >
              Shuffle Again
            </button>
            {statusLines === "correct" && (
              <span className="ml-auto self-center text-sm font-medium text-green-600">
                ✔ Order & indent correct
              </span>
            )}
            {statusLines === "incorrect" && (
              <span className="ml-auto self-center text-sm font-medium text-red-600">
                {wrongDetail === "indent"
                ? "✖ Indent is wrong"
                : wrongDetail === "order"
                ? "✖ Order is wrong"
                : "✖ Order & indent are wrong"}
                        </span>
            )}
          </div>
        </div>

        {/* complexity card */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-app-primary mb-4">
            Select Time & Space Complexities
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 text-sm font-medium">
                Time Complexity
              </label>
              <select
                value={timeSel}
                onChange={(e) => setTimeSel(e.target.value)}
                className="w-full px-3 py-2 border border-app-primary rounded-lg focus:outline-none bg-app-background text-app-text"
              >
                <option value="">-- select --</option>
                {COMPLEXITIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block mb-1 text-sm font-medium">
                Space Complexity
              </label>
              <select
                value={spaceSel}
                onChange={(e) => setSpaceSel(e.target.value)}
                className="w-full px-3 py-2 border border-app-primary rounded-lg focus:outline-none bg-app-background text-app-text"
              >
                <option value="">-- select --</option>
                {COMPLEXITIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-wrap mt-4 gap-4">
            <button
              onClick={checkComplexities}
              className="bg-app-primary text-white px-6 py-2 rounded-lg font-semibold hover:bg-opacity-90"
            >
              Check Complexities
            </button>
            {statusCx === "correct" && (
              <span className="self-center text-sm font-medium text-green-600">
                ✔ Correct
              </span>
            )}
            {statusCx === "incorrect" && (
              <span className="self-center text-sm font-medium text-red-600">
                ✖ Try again
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
