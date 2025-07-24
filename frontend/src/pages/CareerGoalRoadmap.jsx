import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchRoadmap, generateRoadmap } from "../services/roadmapServices";
import { parseRoadmapJson } from "../utils/parseRoadmapJson.js";
import { FaMapSigns } from "react-icons/fa";

const CareerGoalRoadmap = ({ user, onRoadmapGenerated }) => {
  const [error, setError] = useState("");
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState("");
  const [loading, setLoading] = useState(true);
  const [roadmap, setRoadmap] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (!user) return;
    const getRoadmap = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await fetchRoadmap(user.id);
        const parsed = parseRoadmapJson(data.roadmap_json && data.roadmap_json.roadmap);
        setRoadmap(parsed);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    getRoadmap();
  }, [user, generating]);

  const handleGenerateRoadmap = async () => {
    setGenerating(true);
    setGenError("");
    try {
      await generateRoadmap(user.id);
      setGenerating(false);
      if (onRoadmapGenerated) onRoadmapGenerated();
    } catch (err) {
      setGenError(err.message);
      setGenerating(false);
    }
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="loader-lg"/>
    </div>
  );

  if (!roadmap && user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white text-app-text border-2 border-app-primary p-10 rounded-2xl shadow-2xl w-full max-w-lg mt-20 mb-20 flex flex-col items-center">
          <FaMapSigns className="text-app-primary text-5xl mb-4" />
          <h2 className="text-3xl font-extrabold mb-3 text-center text-app-primary">No Roadmap Found</h2>
          <p className="mb-6 text-lg text-center text-gray-600">
            You haven't generated a roadmap yet.<br />Would you like to generate one now?
          </p>
          {genError && <div className="text-red-600 mb-2">{genError}</div>}
          <button
            className="btn-primary w-full py-3 text-lg font-semibold rounded-lg cursor-pointer mt-2"
            onClick={handleGenerateRoadmap}
            disabled={generating}
          >
            Generate Roadmap
          </button>
          {generating && (
            <>
              <div className="fixed inset-0 z-40 backdrop-blur-sm pointer-events-auto"></div>
              <div className="fixed inset-0 z-50 flex items-center justify-center">
                <div className="bg-white text-black rounded-xl p-8 shadow-2xl max-w-md w-full border border-app-primary flex flex-col items-center">
                  <div className="loader-md mb-4"></div>
                  <span className="font-semibold text-lg">Generating your roadmap...</span>
                  {genError && <div className="text-red-600 mt-4">{genError}</div>}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-app-accent text-app-text border border-app-primary p-8 rounded-xl shadow-lg w-full max-w-4xl mt-16 mb-16">
        <button
          className="mb-4 btn-primary px-4 py-2 rounded-md cursor-pointer"
          onClick={() => navigate("/roadmaps")}
        >
          &larr; Back to Roadmap Hub
        </button>
        <h2 className="text-2xl font-bold mb-6 text-center text-app-primary">Your Personalized Roadmap</h2>
        {roadmap.specific_goals && (
          <>
            <h3 className="font-semibold text-lg mt-4 mb-2">Specific Goals</h3>
            <ul className="list-disc ml-6">
              {roadmap.specific_goals.map((goal, i) => <li key={i}>{goal}</li>)}
            </ul>
          </>
        )}
        {roadmap.roadmap && (
          <>
            <h3 className="font-semibold text-lg mt-4 mb-2">Step-by-Step Roadmap</h3>
            <ul className="list-disc ml-6">
              {roadmap.roadmap.map((step, i) => <li key={i}>{step}</li>)}
            </ul>
          </>
        )}
        {roadmap.skills && (
          <>
            <h3 className="font-semibold text-lg mt-4 mb-2">Skills</h3>
            <div className="flex gap-8">
              <div>
                <strong>Technical:</strong>
                <ul className="list-disc ml-6">
                  {(roadmap.skills.technical || []).map((s, i) => <li key={i}>{s}</li>)}
                </ul>
              </div>
              <div>
                <strong>Soft:</strong>
                <ul className="list-disc ml-6">
                  {(roadmap.skills.soft || []).map((s, i) => <li key={i}>{s}</li>)}
                </ul>
              </div>
            </div>
          </>
        )}
        {roadmap.youtube_videos && roadmap.youtube_videos.length > 0 && (
          <>
            <h4 className="font-semibold mt-4 mb-2">YouTube Videos</h4>
            <ul className="list-disc ml-6">
              {roadmap.youtube_videos.map((item, i) => (
                <li key={i}>
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-app-primary underline"
                  >
                    {item.title}
                  </a>
                </li>
              ))}
            </ul>
          </>
        )}
        {roadmap.youtube_search_terms && roadmap.youtube_search_terms.length > 0 && (
          <>
            <h4 className="font-semibold mt-4 mb-2">YouTube Search Terms</h4>
            <ul className="list-disc ml-6">
              {roadmap.youtube_search_terms.map((term, i) => (
                <li key={i}>{term}</li>
              ))}
            </ul>
          </>
        )}
        {roadmap.job_titles && (
          <>
            <h3 className="font-semibold text-lg mt-4 mb-2">Job Titles You Can Apply For</h3>
            <ul className="list-disc ml-6">
              {roadmap.job_titles.map((title, i) => <li key={i}>{title}</li>)}
            </ul>
          </>
        )}
        {roadmap.resource_links && (
          <>
            <h3 className="font-semibold text-lg mt-4 mb-2">Resource Links</h3>
            {Object.entries(roadmap.resource_links).map(([cat, items]) =>
              (items && items.length > 0) && (
                <div key={cat} className="mb-2">
                  <strong className="capitalize">{cat}:</strong>
                  <ul className="list-disc ml-6">
                    {items.map((item, i) => (
                      <li key={i}>
                        <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-app-primary underline">
                          {item.title}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default CareerGoalRoadmap;