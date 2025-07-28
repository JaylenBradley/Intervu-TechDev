const BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";

export async function searchUsers(currentUserId, searchTerm = "", limit = 20) {
  const params = new URLSearchParams({
    current_user_id: currentUserId,
    search_term: searchTerm,
    limit: limit
  });
  
  const res = await fetch(`${BASE_URL}/api/users/search?${params}`);
  if (!res.ok) throw new Error("Failed to search users");
  return res.json();
}

export async function followUser(followerId, followingId) {
  const res = await fetch(`${BASE_URL}/api/friendship`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      follower_id: followerId,
      following_id: followingId
    })
  });
  if (!res.ok) throw new Error("Failed to follow user");
  return res.json();
}

export async function unfollowUser(followerId, followingId) {
  const res = await fetch(`${BASE_URL}/api/friendship/${followerId}/${followingId}`, {
    method: "DELETE"
  });
  if (!res.ok) throw new Error("Failed to unfollow user");
  return res.json();
}

export async function getFollowers(userId) {
  const res = await fetch(`${BASE_URL}/api/friendship/${userId}/followers`);
  if (!res.ok) throw new Error("Failed to get followers");
  return res.json();
}

export async function getFollowing(userId) {
  const res = await fetch(`${BASE_URL}/api/friendship/${userId}/following`);
  if (!res.ok) throw new Error("Failed to get following");
  return res.json();
}

export async function checkFollowingStatus(followerId, followingId) {
  const res = await fetch(`${BASE_URL}/api/friendship/${followerId}/following/${followingId}`);
  if (!res.ok) throw new Error("Failed to check following status");
  return res.json();
} 