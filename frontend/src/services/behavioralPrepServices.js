const BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";

export async function getBehavioralQuestions({ target_role, seniority, company, num_questions, difficulty }) {
  const res = await fetch(`${BASE_URL}/api/behavioral-prep/questions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ target_role, seniority, company, num_questions, difficulty }),
  });
  if (!res.ok) throw new Error("Failed to fetch questions");
  const data = await res.json();
  return data.questions;
}

export async function getBehavioralFeedback({ target_role, seniority, company, question, answer, difficulty, pause_analysis = null }) {
  const res = await fetch(`${BASE_URL}/api/behavioral-prep/feedback`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      target_role,
      seniority,
      company,
      question,
      answer,
      difficulty,
      pause_analysis,
    }),
  });
  if (!res.ok) throw new Error("Failed to fetch feedback");
  const data = await res.json();
  return data.feedback;
}