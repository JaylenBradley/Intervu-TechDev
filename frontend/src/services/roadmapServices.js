const BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";

// Fetch roadmap for a user
export async function fetchRoadmap(userId) {
  const res = await fetch(`${BASE_URL}/api/roadmap/${userId}`);
  if (!res.ok) throw new Error("Failed to fetch roadmap");
  return res.json();
}

// Generate and store roadmap for a user (POST)
export async function generateRoadmap(userId) {
  const res = await fetch(`${BASE_URL}/api/roadmap/${userId}`, { method: "POST" });
  if (!res.ok) throw new Error("Failed to generate roadmap");
  return res.json();
}