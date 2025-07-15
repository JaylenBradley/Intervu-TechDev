const BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000/api";

// Submit (create or update) questionnaire
export async function submitQuestionnaire(data) {
  const res = await fetch(`${BASE_URL}/api/questionnaire`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to submit questionnaire");
  return res.json();
}

// Get questionnaire for a user
export async function fetchQuestionnaire(userId) {
  const res = await fetch(`${BASE_URL}/api/questionnaire/${userId}`);
  if (!res.ok) throw new Error("Failed to fetch questionnaire");
  return res.json();
}

// Update questionnaire (PATCH)
export async function updateQuestionnaire(userId, data) {
  const res = await fetch(`${BASE_URL}/api/questionnaire/${userId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update questionnaire");
  return res.json();
}

// Delete questionnaire
export async function deleteQuestionnaire(userId) {
  const res = await fetch(`${BASE_URL}/api/questionnaire/${userId}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete questionnaire");
  return res.json();
}