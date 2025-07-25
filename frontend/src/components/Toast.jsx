import React, { useEffect, useRef } from "react";

const typeStyles = {
  success: {
    background: "#f0fdf4",
    color: "#166534",
    borderLeft: "6px solid #22c55e",
    bar: "#22c55e",
  },
  error: {
    background: "#fef2f2",
    color: "#991b1b",
    borderLeft: "6px solid #ef4444",
    bar: "#ef4444",
  },
  info: {
    background: "#eff6ff",
    color: "#1e40af",
    borderLeft: "6px solid #3b82f6",
    bar: "#3b82f6",
  },
  warning: {
    background: "#fefce8",
    color: "#92400e",
    borderLeft: "6px solid #f59e42",
    bar: "#f59e42",
  },
};

const fadeIn = {
  animation: "fadeInToast 0.4s",
};

const Toast = ({ message, type = "info", onClose, duration = 4000 }) => {
  const barRef = useRef();

  useEffect(() => {
    if (barRef.current) {
      barRef.current.style.animation = `toastBar ${duration}ms linear forwards`;
    }
  }, [duration]);

  return (
    <div
      style={{
        minWidth: 280,
        maxWidth: 400,
        marginBottom: 16,
        padding: "18px 24px 18px 18px",
        borderRadius: 12,
        boxShadow: "0 4px 24px rgba(0,0,0,0.13)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        fontSize: 16,
        gap: 16,
        position: "relative",
        ...typeStyles[type],
        ...fadeIn,
      }}
    >
      <span style={{ flex: 1 }}>{message}</span>
      <button
        onClick={onClose}
        style={{
          background: "none",
          border: "none",
          color: "inherit",
          fontSize: 22,
          marginLeft: 12,
          cursor: "pointer",
          borderRadius: "50%",
          width: 32,
          height: 32,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "background 0.2s",
        }}
        onMouseOver={e => (e.currentTarget.style.background = "#e5e7eb")}
        onMouseOut={e => (e.currentTarget.style.background = "transparent")}
        aria-label="Close notification"
      >
        <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="6" y1="6" x2="14" y2="14"/><line x1="14" y1="6" x2="6" y2="14"/></svg>
      </button>
      <div
        ref={barRef}
        style={{
          position: "absolute",
          left: 0,
          bottom: 0,
          height: 4,
          width: "100%",
          background: typeStyles[type].bar,
          borderRadius: "0 0 10px 10px",
          transformOrigin: "left",
        }}
      />
      <style>{`
        @keyframes fadeInToast {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes toastBar {
          from { transform: scaleX(1); }
          to { transform: scaleX(0); }
        }
      `}</style>
    </div>
  );
};

export default Toast; 