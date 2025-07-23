const BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";

export async function getResumeFeedback(file) {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch(`${BASE_URL}/api/resume/feedback`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) throw new Error("Failed to get feedback");
  return res.json();
}

export async function fetchUserResume(userId) {
  const response = await fetch(`${BASE_URL}/api/resume/me?user_id=${userId}`);
  if (!response.ok) {
    if (response.status === 404) return null;
    throw new Error("Failed to fetch resume");
  }
  return response.json();
}

export async function enhanceResume(file) {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch(`${BASE_URL}/api/resume/improve`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) throw new Error("Failed to enhance resume");
  return res.json();
}

export async function exportResume(file, format) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("format", format);
  const res = await fetch(`${BASE_URL}/api/resume/export`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) throw new Error("Failed to export resume");
  return res.blob();
}