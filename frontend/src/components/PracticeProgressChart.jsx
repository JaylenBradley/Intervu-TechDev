import { useEffect, useState } from "react";
import { getPracticeHistory, getCurrentStreak } from "../services/dailyStatsServices";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";
import { FaFire } from "react-icons/fa";

const PracticeProgressChart = ({ userId }) => {
  const [history, setHistory] = useState([]);
  const [streak, setStreak] = useState(0);

    useEffect(() => {
      if (!userId) return;
      const fetchData = async () => {
        try {
          const data = await getPracticeHistory(userId, 30);
          const processed = (data || [])
            .sort((a, b) => new Date(a.date) - new Date(b.date))
            .map(stat => ({
              date: stat.date,
              "Average Points": stat.answered ? +(stat.score / stat.answered).toFixed(2) : 0,
            }));
          setHistory(processed);
        } catch (err) {
          setHistory([]);
        }
        try {
          const streakData = await getCurrentStreak(userId);
          setStreak(streakData.current_streak || 0);
        } catch (err) {
          setStreak(0);
        }
      };
      fetchData();
    }, [userId]);

  return (
    <div className="bg-white rounded-xl shadow p-6 border-2 border-app-primary mt-3.5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-app-primary">Practice Progress</h3>
        <div className="flex items-center gap-2">
          <FaFire className="text-orange-500" />
          <span className="text-sm text-gray-500">Streak:</span>
          <span className="font-bold text-lg text-orange-600">{streak}</span>
          <span className="text-sm text-gray-500">days</span>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={history}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis label={{ value: "Average Points", angle: -90, position: "insideLeft" }} />
          <Tooltip />
          <Line type="monotone" dataKey="Average Points" stroke="#2563eb" strokeWidth={3} dot />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PracticeProgressChart;