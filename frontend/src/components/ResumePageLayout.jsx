const ResumePageLayout = ({ children, cardClassName = "" }) => (
  <div className="min-h-screen flex flex-col items-center justify-center relative overflow-x-hidden">
    <div className="relative z-10 w-full max-w-3xl px-6 py-12 flex flex-col items-center">
        <div className="mb-2">
            <button
              className="mb-2 btn-primary w-30 px-4 py-2 rounded-lg font-bold cursor-pointer"
              onClick={() => window.history.back()}
            >
              &larr; Back
            </button>
        </div>
        <div className={`glass-card p-10 flex flex-col items-center shadow-2xl border-2 border-app-primary ${cardClassName}`}>
            {children}
        </div>
    </div>
  </div>
);

export default ResumePageLayout;