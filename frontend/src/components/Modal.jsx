import React from "react";

const Modal = ({ open, message, onConfirm, onCancel, confirmText = "Confirm", cancelText = "Cancel", backgroundClass }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center backdrop-blur-sm transition-opacity duration-200">
      <div className="min-w-[340px] rounded-3xl p-0 bg-white shadow-2xl border-2 border-app-primary text-center animate-modal-in">
        {/* Top accent bar */}
        <div className="h-2 w-full rounded-t-3xl bg-gradient-to-r from-app-primary to-app-secondary mb-0" />
        <div className="p-8">
          {/* Custom icon */}
          <div className="flex justify-center mb-4">
            <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-app-primary/10 text-app-primary text-3xl shadow">
              &#9888;
            </span>
          </div>
          <div className="mb-6 text-lg text-app-primary font-semibold">{message}</div>
          <div className="flex justify-center gap-4">
            <button
              className="px-6 py-2 rounded-lg btn-primary font-semibold transition-colors cursor-pointer"
              onClick={onCancel}
            >
              {cancelText}
            </button>
            <button
              className="px-6 py-2 rounded-lg btn-primary font-semibold transition-colors cursor-pointer"
              onClick={onConfirm}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
      {/* Animation styles */}
      <style>
        {`
          .animate-modal-in {
            animation: modalIn 0.25s cubic-bezier(0.4,0,0.2,1);
          }
          @keyframes modalIn {
            0% { opacity: 0; transform: scale(0.95);}
            100% { opacity: 1; transform: scale(1);}
          }
        `}
      </style>
    </div>
  );
};

export default Modal; 