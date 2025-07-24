import CodeMirror      from "@uiw/react-codemirror";
import { python }      from "@codemirror/lang-python";

export default function CodePanel({
  codeAnswer,
  setCodeAnswer,
  codeLoading,
  onSubmit,              
  fetchHint,
  hintLoading,
  hintText,
  codeFeedback,
  elimMode,
  setElimMode,
  elimCount,
  setElimCount,
  buildEliminatedCode,
}) {
  return (
    <>
      {/* editor + actions */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <span className="font-medium text-app-text text-sm">Auto‑blank:</span>

          {["random", "last"].map((m, i) => (
            <button
              key={m}
              onClick={() => setElimMode(m)}
              className={`px-4 py-1.5 text-sm font-semibold border          
                          ${i === 0 ? "rounded-l-lg" : "rounded-r-lg"}
                          ${
                            elimMode === m
                              ? "bg-app-primary text-white"
                              : "bg-white text-app-text hover:bg-gray-50"
                          }`}
            >
              {m === "random" ? "Random N" : "Last N"}
            </button>
          ))}

          <input
            type="number"
            min={1}
            max={99}
            disabled={elimMode === "none"}
            value={elimCount}
            onChange={(e) => setElimCount(e.target.value)}
            className="h-9 w-20 px-3 border rounded-lg text-sm
                       bg-white focus:ring-app-primary focus:border-app-primary
                       disabled:opacity-50"
          />

          <button
            onClick={() =>
              elimMode !== "none" &&
              setCodeAnswer(buildEliminatedCode(elimMode))
            }
            disabled={elimMode === "none"}
            className="btn-primary px-4 py-1.5 rounded-lg font-semibold
                       disabled:opacity-50"
          >
            Apply
          </button>
        </div>

        <CodeMirror
          value={codeAnswer}
          height="240px"
          basicSetup={{ lineNumbers: true, indentWithTab: true }}
          extensions={[python()]}
          onChange={setCodeAnswer}
          theme="light"
          className="border border-app-primary rounded-lg"
        />

        <div className="flex gap-4 mt-4 flex-wrap" >
          <button
            onClick={onSubmit}
            disabled={codeLoading || !codeAnswer.trim()}
            className="btn-primary px-6 py-2 rounded-lg font-semibold"
          >
            {codeLoading ? "Evaluating…" : "Submit"}
          </button>

          <button
            onClick={fetchHint}
            disabled={hintLoading}
            className="btn-primary px-6 py-2 rounded-lg font-semibold"
          >
            {hintLoading ? "Loading…" : "Need a hint?"}
          </button>

          {hintText && (
            <p className="flex-1 text-sm text-app-primary bg-amber-50 border border-amber-200 rounded p-2">
              {hintText}
            </p>
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
    </>
  );
}
