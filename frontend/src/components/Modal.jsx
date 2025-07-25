import React from "react";

const Modal = ({ open, message, onConfirm, onCancel, confirmText = "Confirm", cancelText = "Cancel", backgroundClass }) => {
  if (!open) return null;
  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100vw",
      height: "100vh",
      background: "rgba(0,0,0,0.3)",
      zIndex: 10000,
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }}>
      <div
        className={backgroundClass}
        style={{
          background: backgroundClass ? undefined : "#fff",
          borderRadius: 10,
          padding: 32,
          minWidth: 320,
          boxShadow: "0 4px 24px rgba(0,0,0,0.18)",
          textAlign: "center"
        }}
      >
        <div style={{ marginBottom: 24, fontSize: 18 }}>{message}</div>
        <div style={{ display: "flex", justifyContent: "center", gap: 16 }}>
          <button onClick={onCancel} style={{ padding: "8px 20px", borderRadius: 6, border: "1px solid #ccc", background: "#f5f5f5", cursor: "pointer" }}>{cancelText}</button>
          <button onClick={onConfirm} style={{ padding: "8px 20px", borderRadius: 6, border: "none", background: "#2196f3", color: "#fff", cursor: "pointer" }}>{confirmText}</button>
        </div>
      </div>
    </div>
  );
};

export default Modal; 