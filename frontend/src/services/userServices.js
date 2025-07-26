const BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";

export async function createUser(userData) {
  const response = await fetch(`${BASE_URL}/api/user`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData),
  });
  if (!response.ok) throw new Error("Failed to create user");
  return response.json();
}

export async function getAllUsers() {
  const response = await fetch(`${BASE_URL}/api/users`);
  if (!response.ok) throw new Error("Failed to fetch users");
  return response.json();
}

export async function getUser(id) {
  const response = await fetch(`${BASE_URL}/api/user/${id}`);
  if (!response.ok) throw new Error("User not found");
  return response.json();
}

export async function getUserByFirebaseId(firebaseId) {
  const response = await fetch(`${BASE_URL}/api/user/firebase/${firebaseId}`);
  if (!response.ok) throw new Error("User not found");
  return response.json();
}

// Mark questionnaire as complete
export async function completeQuestionnaire(id) {
  const res = await fetch(`${BASE_URL}/api/user/${id}/questionnaire-complete`, { method: "POST" });
  if (!res.ok) throw new Error("Failed to complete questionnaire");
  return res.json();
}

export async function fetchQuestionnaireStatus(id) {
  const res = await fetch(`${BASE_URL}/api/user/${id}/questionnaire-status`);
  if (!res.ok) throw new Error("Failed to fetch status");
  return res.json();
}

export async function updateUser(id, userData) {
  const response = await fetch(`${BASE_URL}/api/user/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData),
  });
  if (!response.ok) throw new Error("Failed to update user");
  return response.json();
}

export async function deleteUser(id) {
  const response = await fetch(`${BASE_URL}/api/user/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) throw new Error("Failed to delete user");
  return response.json();
}