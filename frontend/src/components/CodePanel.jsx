import CodeMirror      from "@uiw/react-codemirror";
import { python }      from "@codemirror/lang-python";
import { useState, useEffect, useRef } from "react";

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
  const [timerEnabled, setTimerEnabled] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const intervalRef = useRef(null);

  // Format time as MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Start timer
  const startTimer = () => {
    if (!timerEnabled) return;
    setIsRunning(true);
    intervalRef.current = setInterval(() => {
      setTimeElapsed(prev => prev + 1);
    }, 1000);
  };

  // Pause timer
  const pauseTimer = () => {
    setIsRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  // Reset timer
  const resetTimer = () => {
    pauseTimer();
    setTimeElapsed(0);
  };

  // Handle submit with timer stop
  const handleSubmit = () => {
    if (timerEnabled && isRunning) {
      pauseTimer();
    }
    onSubmit();
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Auto-start timer when enabled
  useEffect(() => {
    if (timerEnabled && !isRunning && timeElapsed === 0) {
      startTimer();
    }
  }, [timerEnabled]);

return (
    <>
        {/* editor + actions */}
     
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-2">
        <div className="flex justify-between items-center mb-3">
          <label className="font-medium text-app-text block ml-1">
                  Auto‑blank lines in solution
          </label>
          
          {/* Timer Section */}
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={timerEnabled}
                onChange={(e) => {
                  setTimerEnabled(e.target.checked);
                  if (!e.target.checked) {
                    resetTimer();
                  }
                }}
                className="w-4 h-4 text-app-primary bg-gray-100 border-gray-300 cursor-pointer"
                style={{ accentColor: 'var(--primary)' }}
              />
              <span className="text-sm font-medium text-app-text">Timer</span>
            </label>

            {timerEnabled && (
              <div className="flex items-center gap-2">
                <div className="bg-white border border-gray-300 px-3 py-1 rounded-lg">
                  <span className="text-lg font-mono font-bold text-app-primary">
                    {formatTime(timeElapsed)}
                  </span>
                </div>
                <div className={`w-2 h-2 rounded-full ${isRunning ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>

                <div className="flex gap-1">
                  {isRunning ? (
                    <button
                      onClick={pauseTimer}
                      className="
                          btn-danger px-2 py-1  text-white rounded text-xs
                          font-medium transition-colors cursor-pointer"
                      title="Pause timer"
                    >
                      ⏸
                    </button>
                  ) : (
                    <button
                      onClick={startTimer}
                      className="
                          px-2 py-1 bg-app-primary text-white rounded text-xs font-medium
                          hover:bg-app-primary/90 transition-colors cursor-pointer"
                      title="Resume timer"
                    >
                      ▶
                    </button>
                  )}
                  
                  <button
                    onClick={resetTimer}
                    className="
                        px-2 py-1 bg-gray-500 text-white rounded text-xs font-medium
                      hover:bg-gray-600 transition-colors cursor-pointer"
                    title="Reset timer"
                  >
                    ↻
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 mb-3">
            {/* dropdown instead of pill buttons */}
        <select
            value={elimMode}
            onChange={(e) => setElimMode(e.target.value)}
            className="
                px-4 py-1.5 text-sm font-semibold border rounded-lg bg-white
                text-app-text focus:ring-app-primary focus:border-app-primary cursor-pointer"
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

            className="btn-primary px-4 py-1.5 rounded-lg font-semibold cursor-pointer"
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
                    onClick={handleSubmit}
                    disabled={codeLoading || !codeAnswer.trim()}
                    className="btn-primary px-6 py-2 rounded-lg font-semibold cursor-pointer"
                >
                    {codeLoading ? "Evaluating…" : "Submit"}
                </button>

                <button
                    onClick={fetchHint}
                    disabled={hintLoading}
                    className="btn-primary px-6 py-2 rounded-lg font-semibold cursor-pointer"
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
