const BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";

export async function updateGoal(userId, goal, statDate = null) {
  const url = new URL(`${BASE_URL}/api/daily-practice/${userId}/goal`);
  if (statDate) url.searchParams.append("stat_date", statDate);
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ goal }),
  });
  if (!res.ok) throw new Error("Failed to update goal");
  return res.json();
}

export async function updateAnswers(userId, increment = 1, statDate = null) {
  const url = new URL(`${BASE_URL}/api/daily-practice/${userId}/answers`);
  url.searchParams.append("increment", increment);
  if (statDate) url.searchParams.append("stat_date", statDate);
  const res = await fetch(url, { method: "POST" });
  if (!res.ok) throw new Error("Failed to update answers");
  return res.json();
}

export async function updateScore(userId, scoreIncrement, statDate = null) {
  const url = new URL(`${BASE_URL}/api/daily-practice/${userId}/score`);
  url.searchParams.append("score_increment", scoreIncrement);
  if (statDate) url.searchParams.append("stat_date", statDate);
  const res = await fetch(url, { method: "POST" });
  if (!res.ok) throw new Error("Failed to update score");
  return res.json();
}

export async function getGoal(userId, statDate = null) {
  const url = new URL(`${BASE_URL}/api/daily-practice/${userId}/goal`);
  if (statDate) url.searchParams.append("stat_date", statDate);
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to get goal");
  return res.json();
}

export async function getTodayStats(userId) {
  const res = await fetch(`${BASE_URL}/api/daily-practice/${userId}/today`);
  if (!res.ok) throw new Error("Failed to get today's stats");
  return res.json();
}

export async function getCurrentStreak(userId) {
  const res = await fetch(`${BASE_URL}/api/daily-practice/${userId}/streak`);
  if (!res.ok) throw new Error("Failed to get current streak");
  return res.json();
}

export async function getPracticeHistory(userId, limit = 30) {
  const url = new URL(`${BASE_URL}/api/daily-practice/${userId}/history`);
  url.searchParams.append("limit", limit);
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to get practice history");
  return res.json();
}

export async function getLeaderboardByStreaks(limit = 10) {
  const url = new URL(`${BASE_URL}/api/leaderboards/streaks`);
  url.searchParams.append("limit", limit);
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to get streaks leaderboard");
  return res.json();
}

export async function getLeaderboardByPoints(limit = 10) {
  const url = new URL(`${BASE_URL}/api/leaderboards/points`);
  url.searchParams.append("limit", limit);
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to get points leaderboard");
  return res.json();
}

export async function getStatsByDate(userId, statDate) {
  const url = new URL(`${BASE_URL}/api/daily-practice/${userId}/${statDate}`);
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to get stats by date");
  return res.json();
}