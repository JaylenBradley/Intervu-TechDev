import { useState, useEffect } from "react";
import { getLeaderboardByStreaks, getLeaderboardByPoints } from "../services/dailyStatsServices";
import { FaTrophy, FaFire, FaStar } from "react-icons/fa";

const Leaderboard = () => {
  const [activeTab, setActiveTab] = useState("streaks");
  const [streaksData, setStreaksData] = useState([]);
  const [pointsData, setPointsData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchLeaderboardData();
  }, []);

  const fetchLeaderboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log("Fetching leaderboard data...");
      const [streaks, points] = await Promise.all([
        getLeaderboardByStreaks(5),
        getLeaderboardByPoints(5)
      ]);
      console.log("Streaks data:", streaks);
      console.log("Points data:", points);
      setStreaksData(streaks);
      setPointsData(points);
    } catch (error) {
      console.error("Failed to fetch leaderboard data:", error);
      setError("Failed to load leaderboard data");
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank) => {
    if (rank === 1) return <FaTrophy className="text-yellow-500" />;
    if (rank === 2) return <FaTrophy className="text-gray-400" />;
    if (rank === 3) return <FaTrophy className="text-orange-600" />;
    return null;
  };

  const getRankColor = (rank) => {
    if (rank === 1) return "bg-yellow-100 border-yellow-300";
    if (rank === 2) return "bg-gray-100 border-gray-300";
    if (rank === 3) return "bg-orange-100 border-orange-300";
    return "bg-white border-gray-200";
  };

  const renderUserAvatar = (user) => {
    if (user.avatar) {
      return (
        <img
          src={user.avatar}
          alt={user.username}
          className="w-10 h-10 rounded-full object-cover"
        />
      );
    }
    return (
      <div className="w-10 h-10 rounded-full bg-app-accent flex items-center justify-center text-sm font-bold text-app-primary">
        {user.username[0].toUpperCase()}
      </div>
    );
  };

  const renderLeaderboardItem = (user, rank, isStreaks = true) => (
    <div
      key={user.user_id}
      className={`flex items-center justify-between p-4 rounded-lg border-2 ${getRankColor(rank)} hover:shadow-md transition-shadow`}
    >
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-gray-600">#{rank}</span>
          {getRankIcon(rank)}
        </div>
        {renderUserAvatar(user)}
        <div className="flex flex-col">
          <span className="font-semibold text-gray-800">{user.username}</span>
          {user.career_goal && (
            <span className="text-xs text-gray-500">{user.career_goal}</span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        {isStreaks ? (
          <>
            <FaFire className="text-orange-500" />
            <span className="font-bold text-lg text-orange-600">{user.streak}</span>
            <span className="text-sm text-gray-500">days</span>
          </>
        ) : (
          <>
            <FaStar className="text-yellow-500" />
            <span className="font-bold text-lg text-yellow-600">{user.total_points.toLocaleString()}</span>
            <span className="text-sm text-gray-500">points</span>
          </>
        )}
      </div>
    </div>
  );

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow p-6 border-2 border-app-primary">
        <div className="text-center py-8">
          <p className="text-red-500 mb-2">{error}</p>
          <button 
            onClick={fetchLeaderboardData}
            className="btn-primary px-4 py-2 rounded-lg"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow p-6 border-2 border-app-primary mt-3.5">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-app-primary">Leaderboard</h3>
        <div className="flex bg-gray-100 rounded-lg p-1 shadow-inner">
          <button
            onClick={() => setActiveTab("streaks")}
            className={`px-4 py-2 rounded-md font-medium transition-all duration-200 ease-in-out cursor-pointer ${
              activeTab === "streaks"
                ? "bg-white text-app-primary shadow-md transform scale-105"
                : "text-gray-600 hover:text-gray-800 hover:bg-gray-50 hover:shadow-sm"
            }`}
          >
            <div className="flex items-center gap-2">
              <FaFire className={`${activeTab === "streaks" ? "text-orange-500" : "text-orange-400"}`} />
              Streaks
            </div>
          </button>
          <button
            onClick={() => setActiveTab("points")}
            className={`px-4 py-2 rounded-md font-medium transition-all duration-200 ease-in-out cursor-pointer ${
              activeTab === "points"
                ? "bg-white text-app-primary shadow-md transform scale-105"
                : "text-gray-600 hover:text-gray-800 hover:bg-gray-50 hover:shadow-sm"
            }`}
          >
            <div className="flex items-center gap-2">
              <FaStar className={`${activeTab === "points" ? "text-yellow-500" : "text-yellow-400"}`} />
              Points
            </div>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-app-primary mx-auto"></div>
          <p className="text-gray-500 mt-2">Loading leaderboard...</p>
        </div>
      ) : (
        <div className="space-y-3">
          {activeTab === "streaks" ? (
            streaksData.length > 0 ? (
              streaksData.map((user, index) => renderLeaderboardItem(user, index + 1, true))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <FaFire className="text-4xl mx-auto mb-2 text-gray-300" />
                <p>No active streaks yet</p>
                <p className="text-sm">Start practicing to build your streak!</p>
              </div>
            )
          ) : (
            pointsData.length > 0 ? (
              pointsData.map((user, index) => renderLeaderboardItem(user, index + 1, false))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <FaStar className="text-4xl mx-auto mb-2 text-gray-300" />
                <p>No points earned yet</p>
                <p className="text-sm">Complete practice sessions to earn points!</p>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
};

export default Leaderboard; 