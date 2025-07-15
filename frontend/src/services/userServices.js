const BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000/api";

// Create a new user
export async function createUser(userData) {
  const response = await fetch(`${BASE_URL}/user`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData),
  });
  if (!response.ok) throw new Error("Failed to create user");
  return response.json();
};

// Mark questionnaire as complete
export async function completeQuestionnaire(userId) {
  const res = await fetch(`/api/user/${userId}/questionnaire-complete`, { method: "POST" });
  if (!res.ok) throw new Error("Failed to complete questionnaire");
  return res.json();
}

// Get all users
export async function getAllUsers() {
  const response = await fetch(`${BASE_URL}/users`);
  if (!response.ok) throw new Error("Failed to fetch users");
  return response.json();
}

// Get a user by ID
export async function getUser(id) {
  const response = await fetch(`${BASE_URL}/user/${id}`);
  if (!response.ok) throw new Error("User not found");
  return response.json();
};

export async function getUserByFirebaseId(firebaseId) {
  const response = await fetch(`${BASE_URL}/user/firebase/${firebaseId}`);
  if (!response.ok) throw new Error("User not found");
  return response.json();
}

// Fetch questionnaire status
export async function fetchQuestionnaireStatus(userId) {
  const res = await fetch(`/api/user/${userId}/questionnaire-status`);
  if (!res.ok) throw new Error("Failed to fetch status");
  return res.json();
}

// Update a user by ID
export async function updateUser(id, userData) {
  const response = await fetch(`${BASE_URL}/user/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData),
  });
  if (!response.ok) throw new Error("Failed to update user");
  return response.json();
};

// Delete a user by ID
export async function deleteUser(id) {
  const response = await fetch(`${BASE_URL}/user/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) throw new Error("Failed to delete user");
  return response.json();
};