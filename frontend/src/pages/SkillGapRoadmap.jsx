import { useEffect, useState } from "react";
import { fetchJobDescRoadmaps, createJobDescRoadmap } from "../services/roadmapServices";
import { parseRoadmapJson } from "../utils/parseRoadmapJson.js";

const SkillGapRoadmap = ({ user }) => {
  const [roadmaps, setRoadmaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState("");
  const [error, setError] = useState("");
  const [jobDescription, setJobDescription] = useState("");

  useEffect(() => {
    if (!user) return;
    const getRoadmaps = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await fetchJobDescRoadmaps(user.id);
        setRoadmaps(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    getRoadmaps();
  }, [user, generating]);

  const handleGenerateRoadmap = async () => {
    setGenerating(true);
    setGenError("");
    try {
      await createJobDescRoadmap(user.id, jobDescription);
      setGenerating(false);
      setJobDescription("");
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

  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <div className="bg-app-accent text-app-text border border-app-primary p-8 rounded-xl shadow-lg w-full max-w-4xl mt-16 mb-16">
        <h2 className="text-2xl font-bold mb-6 text-center text-app-primary">Job Description Roadmaps</h2>
        <form
          className="mb-8 flex flex-col items-center"
          onSubmit={e => { e.preventDefault(); handleGenerateRoadmap(); }}
        >
          <textarea
            className="w-full border border-app-primary rounded-lg p-3 mb-4"
            rows={4}
            placeholder="Paste a job description here to generate a roadmap..."
            value={jobDescription}
            onChange={e => setJobDescription(e.target.value)}
            required
            disabled={generating}
          />
          {genError && <div className="text-red-600 mb-2">{genError}</div>}
          <button
            className="btn-primary w-full py-3 text-lg font-semibold rounded-lg"
            type="submit"
            disabled={generating || !jobDescription}
          >
            {generating ? <div className="loader-md mr-2"></div> : null}
            {generating ? "Generating..." : "Generate Job Description Roadmap"}
          </button>
        </form>
        {roadmaps.length === 0 && (
          <div className="text-center text-app-primary">No job description roadmaps found.</div>
        )}
        {roadmaps.map((roadmapObj, idx) => {
          const roadmap = parseRoadmapJson(roadmapObj.roadmap_json);
          return (
            <div key={roadmapObj.id} className="mb-8 p-6 border rounded-lg bg-white shadow">
              <h3 className="font-semibold text-lg mb-2">Job Description</h3>
              <pre className="bg-gray-100 p-2 rounded mb-4 whitespace-pre-wrap">{roadmapObj.job_description}</pre>
              {roadmap.specific_goals && (
                <>
                  <h4 className="font-semibold mt-4 mb-2">Specific Goals</h4>
                  <ul className="list-disc ml-6">
                    {roadmap.specific_goals.map((goal, i) => <li key={i}>{goal}</li>)}
                  </ul>
                </>
              )}
              {roadmap.roadmap && (
                <>
                  <h4 className="font-semibold mt-4 mb-2">Step-by-Step Roadmap</h4>
                  <ul className="list-disc ml-6">
                    {roadmap.roadmap.map((step, i) => <li key={i}>{step}</li>)}
                  </ul>
                </>
              )}
              {roadmap.skills && (
                <>
                  <h4 className="font-semibold mt-4 mb-2">Skills</h4>
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
                  <h4 className="font-semibold mt-4 mb-2">Job Titles You Can Apply For</h4>
                  <ul className="list-disc ml-6">
                    {roadmap.job_titles.map((title, i) => <li key={i}>{title}</li>)}
                  </ul>
                </>
              )}
              {roadmap.resource_links && (
                <>
                  <h4 className="font-semibold mt-4 mb-2">Resource Links</h4>
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
          );
        })}
      </div>
    </div>
  );
};

export default SkillGapRoadmap;