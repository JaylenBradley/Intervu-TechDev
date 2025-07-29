const BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";

export async function uploadAudio(file) {
  const formData = new FormData();
  formData.append("audio", file);
  const res = await fetch(`${BASE_URL}/api/behavioral-prep/transcribe`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) throw new Error("Failed to transcribe audio");
  const data = await res.json();
  return {
    transcript: data.transcript,
    pause_analysis: data.pause_analysis
  };
}