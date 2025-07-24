export default function ProgressHeader({ title, qIndex, qTotal, percent }) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex justify-between items-center mb-2 flex-wrap">
        <h1 className="text-2xl font-bold text-app-primary">{title}</h1>
        <span className="text-sm text-app-text">
          Question {qIndex + 1} of {qTotal}
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-app-primary h-2 rounded-full transition-[width] duration-500 ease-out"
          style={{ width: `${percent}%` }}
        />
      </div>
      <div className="flex justify-end text-xs text-gray-500 mt-1">
        {percent}% Complete
      </div>
    </div>
  );
}
