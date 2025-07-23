const BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";

export async function fetchUserResume(userId) {
  const response = await fetch(`${BASE_URL}/api/resume/me?user_id=${userId}`);
  if (!response.ok) {
    if (response.status === 404) return null;
    throw new Error("Failed to fetch resume");
  }
  return response.json();
}

export async function tailorResumeToJobDescription(userId, jobDescription) {
  const response = await fetch(`${BASE_URL}/api/resume/tailor`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id: userId, job_description: jobDescription })
  });
  if (!response.ok) {
    throw new Error("Failed to tailor resume");
  }
  return response.json();
} 