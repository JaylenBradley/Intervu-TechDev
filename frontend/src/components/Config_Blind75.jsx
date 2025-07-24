export default function ConfigBlind75({
  showConfig, setShowConfig,
  numQuestions, setNumQuestions,
  evaluationMode, setEvaluationMode,
  elimMode, setElimMode,
  elimCount, setElimCount,
  startQuiz,
  handleSaveCfg,
  handleCancelCfg,
}) {
  return (
    <div className="min-h-screen flex items-center justify-center py-16">
      <div className="bg-white shadow-xl rounded-2xl w-full max-w-lg p-10 space-y-6">
        <h1 className="text-center text-3xl font-extrabold text-app-primary">
          Technical Prep
        </h1>

        {/* toggle config panel */}
        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => setShowConfig((v) => !v)}
            className="flex items-center gap-1 text-app-primary text-sm
                       px-3 py-1 border border-app-primary rounded-lg
                       hover:bg-app-primary hover:text-white transition"
          >
            Settings
          </button>
        </div>

        {/* form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            startQuiz();
          }}
          className="space-y-6"
        >
          {/* always‑visible field */}
          <div>
            <label className="block mb-1 font-medium text-app-text">
              Number of Questions
            </label>
            <select
              value={numQuestions}
              onChange={(e) => setNumQuestions(+e.target.value)}
              className="w-full px-3 py-2 border border-app-primary rounded-lg
                         bg-app-background focus:outline-none"
            >
              {[3, 5, 10].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>

          {/* advanced settings */}
          {showConfig && (
            <>
              {/* evaluation mode */}
              <div className="flex items-center justify-between bg-gray-50
                              border border-gray-200 rounded-lg p-3">
                <label className="font-medium text-app-text">
                  Evaluation mode
                  <br />
                  <span className="text-xs text-gray-500">
                    (write code after each reorder)
                  </span>
                </label>

                {/* controlled toggle */}
                <button
                  type="button"
                  onClick={() => setEvaluationMode(!evaluationMode)}
                  className="relative w-11 h-6 focus:outline-none"
                >
                  <span
                    className={`block w-full h-full rounded-full transition-colors
                                ${
                                  evaluationMode
                                    ? 'bg-app-primary'
                                    : 'bg-gray-300'
                                }`}
                  />
                  <span
                    className={`absolute top-0.5 left-0.5 h-5 w-5 bg-white rounded-full
                                transition-transform duration-200
                                ${evaluationMode ? 'translate-x-5' : ''}`}
                  />
                </button>
              </div>

              {/* auto‑blank */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <label className="block font-medium text-app-text mb-2">
                  Auto‑blank lines in solution
                </label>

                <div className="flex flex-wrap items-center gap-3">
                  <select
                    value={elimMode}
                    onChange={(e) => setElimMode(e.target.value)}
                    className="px-3 py-2 border rounded-lg bg-white focus:outline-none"
                  >
                    <option value="none">Off</option>
                    <option value="random">Random N</option>
                    <option value="last">Last N</option>
                  </select>

                  <input
                    type="number"
                    min={1}
                    max={99}
                    disabled={elimMode === 'none'}
                    value={elimCount}
                    onChange={(e) => setElimCount(+e.target.value)}
                    className="w-20 px-3 py-2 border rounded-lg bg-white
                               focus:outline-none disabled:opacity-50"
                  />
                  <span className="text-sm text-gray-500">lines</span>
                </div>
              </div>

              {/* save / cancel */}
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={handleCancelCfg}
                  className="px-4 py-1 rounded-lg text-sm border"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveCfg}
                  className="btn-primary px-4 py-1 rounded-lg text-sm"
                >
                  Save
                </button>
              </div>
            </>
          )}

          <button className="btn-primary w-full py-2 rounded-lg font-semibold">
            Start Practice
          </button>
        </form>
      </div>
    </div>
  );
}
