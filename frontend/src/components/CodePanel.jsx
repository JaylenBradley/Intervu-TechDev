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
     
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-2">
        <label className="font-medium text-app-text block ml-1">
                Auto‑blank lines in solution
        </label>

        <div className="flex flex-wrap items-center gap-3 mb-3">
            {/* dropdown instead of pill buttons */}
        <select
            value={elimMode}
            onChange={(e) => setElimMode(e.target.value)}
            className="px-4 py-1.5 text-sm font-semibold border rounded-lg
                                bg-white text-app-text focus:ring-app-primary focus:border-app-primary"
        >
            <option value="none">Off</option>
            <option value="random">Random N</option>
            <option value="last">Last N</option>
        </select>

        {/* N input */}
        <input
            type="number"
            min={1}
            max={99}
            disabled={elimMode === "none"}
            value={elimCount}
            onChange={(e) => setElimCount(+e.target.value)}
            className="h-9 w-20 px-3 border rounded-lg text-sm
                                bg-white focus:ring-app-primary focus:border-app-primary
                                disabled:opacity-50"
        />
        <span className="text-sm text-gray-500">lines</span>
            {/* Apply button (no persistence) */}
            <button
            onClick={() =>
                setCodeAnswer(
                    elimMode === "none"
                    ? buildEliminatedCode("none")
                    : buildEliminatedCode(elimMode)
                )
            }

            className="btn-primary px-4 py-1.5 rounded-lg font-semibold"
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

             
            </div>
             {hintText && (
                    <p className="flex-1 text-sm text-gray-600 border border-gray-300 rounded p-2 mt-4">
                        {hintText}
                    </p>
                )}

            {/* feedback */}
            {codeFeedback && (
                <div className="mt-6 space-y-3">
                    <div>
                        <span className="font-medium">Score:</span>{" "}
                        <span className="font-bold">
                            {Math.round(codeFeedback.score)}/100
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
