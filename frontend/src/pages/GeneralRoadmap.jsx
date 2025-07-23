import { useEffect, useState } from "react";
import { fetchRoadmap, generateRoadmap } from "../services/roadmapServices";
import { parseRoadmapJson } from "../utils/parseRoadmapJson.js";

const GeneralRoadmap = ({ user, onRoadmapGenerated }) => {
  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState("");
  const [error, setError] = useState("");

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
  };

  if (loading || generating) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="loader-lg"/>
    </div>
  );

  if (!roadmap && user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-app-accent text-app-text border border-app-primary p-8 rounded-xl shadow-lg w-full max-w-md mt-16 mb-16 flex flex-col items-center">
          <h2 className="text-2xl font-bold mb-4 text-center text-app-primary">No Roadmap Found</h2>
          <p className="mb-6 text-center">You haven't generated a roadmap yet. Would you like to generate one now?</p>
          {genError && <div className="text-red-600 mb-2">{genError}</div>}
          <button
            className="btn-primary w-full py-3 text-lg font-semibold rounded-lg"
            onClick={handleGenerateRoadmap}
            disabled={generating}
          >
            {generating ? <div className="loader-md mr-2"></div> : null}
            {generating ? "Generating..." : "Generate GeneralRoadmap"}
          </button>
        </div>
      </div>
    );
  }

  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-app-accent text-app-text border border-app-primary p-8 rounded-xl shadow-lg w-full max-w-4xl mt-16 mb-16">
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
        {roadmap.youtube_search_terms && roadmap.youtube_search_terms.length > 0 &&(
          <>
            <h3 className="font-semibold text-lg mt-4 mb-2">YouTube Videos</h3>
            <ul className="list-disc ml-6">
              {roadmap.youtube_search_terms.map((item, i) => (
                <li key={i}>
                  <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-app-primary underline">
                    {item.title}
                  </a>
                </li>
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

export default GeneralRoadmap;