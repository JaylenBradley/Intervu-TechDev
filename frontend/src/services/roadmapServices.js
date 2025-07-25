const BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";

// General Roadmap
export async function generateRoadmap(userId) {
  const res = await fetch(`${BASE_URL}/api/roadmap/${userId}`, { method: "POST" });
  if (!res.ok) throw new Error("Failed to generate roadmap");
  return res.json();
}

export async function fetchRoadmap(userId) {
  const res = await fetch(`${BASE_URL}/api/roadmap/${userId}`);
  if (!res.ok) throw new Error("Failed to fetch roadmap");
  return res.json();
}

// Skill Gap (Job Description) Roadmap
export async function createJobDescRoadmap(userId, jobDescription) {
  const res = await fetch(`${BASE_URL}/api/roadmap/jobdesc/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_id: userId, job_description: jobDescription }),
  });
  if (!res.ok) throw new Error("Failed to create job description roadmap");
  return res.json();
}

export async function fetchJobDescRoadmaps(userId) {
  const res = await fetch(`${BASE_URL}/api/roadmap/jobdesc/${userId}`);
  if (!res.ok) throw new Error("Failed to fetch job description roadmaps");
  return res.json();
}

export async function fetchJobDescRoadmap(userId, roadmapId) {
  const res = await fetch(`${BASE_URL}/api/roadmap/jobdesc/${userId}/${roadmapId}`);
  if (!res.ok) throw new Error("Failed to fetch job description roadmap");
  return res.json();
}

export async function updateJobDescRoadmapTitle(roadmapId, newTitle) {
  const res = await fetch(`${BASE_URL}/api/roadmap/jobdesc/${roadmapId}/title`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title: newTitle }),
  });
  if (!res.ok) throw new Error("Failed to update roadmap title");
  return res.json();
}

export async function deleteJobDescRoadmap(roadmapId) {
  const res = await fetch(`${BASE_URL}/api/roadmap/jobdesc/${roadmapId}`, {
    method: "DELETE"
  });
  if (!res.ok) throw new Error("Failed to delete roadmap");
  return res.json();
}