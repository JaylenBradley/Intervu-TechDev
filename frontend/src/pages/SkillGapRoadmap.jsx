import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  fetchJobDescRoadmaps,
  createJobDescRoadmap,
  deleteJobDescRoadmap
} from "../services/roadmapServices";
import { parseRoadmapJson } from "../utils/parseRoadmapJson.js";

const SkillGapRoadmap = ({ user }) => {
  const [roadmaps, setRoadmaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState("");
  const [error, setError] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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
    setLoading(false);
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

  const handleDeleteRoadmap = async (roadmapId) => {
    if (!window.confirm("Are you sure you want to delete this roadmap?")) return;
    try {
      await deleteJobDescRoadmap(roadmapId);
      setRoadmaps((prev) => prev.filter((r) => r.id !== roadmapId));
      alert("Roadmap sucessfully deleted");
    } catch (err) {
      setError(err.message || "Failed to delete roadmap.");
    }
  };

  if (loading && !generating)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loader-lg" />
      </div>
    );

  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <div className="min-h-screen flex flex-col items-center">
      <div className="w-full max-w-5xl mt-16 mb-16">
        <button
          className="mb-4 btn-primary px-4 py-2 rounded-md cursor-pointer"
          onClick={() => navigate("/roadmaps")}
        >
          &larr; Back to Roadmap Hub
        </button>
        <h2 className="text-3xl font-bold mb-8 text-center text-app-primary">
          Skill Gap Roadmaps
        </h2>
        {/* Generation Card */}
        <div className="bg-white border border-app-primary rounded-xl shadow-lg p-8 mb-10 flex flex-col items-center">
          <h3 className="text-xl font-semibold mb-4 text-app-primary">Generate a New Roadmap</h3>
          <form
            className="w-full flex flex-col items-center"
            onSubmit={(e) => {
              e.preventDefault();
              handleGenerateRoadmap();
            }}
          >
            <textarea
              className="w-full border-2 border-app-primary rounded-lg p-3 mb-4"
              rows={4}
              placeholder="Paste a job description here to generate a roadmap..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              required
              disabled={generating}
            />
            {genError && <div className="text-red-600 mb-2">{genError}</div>}
            <button
              className="btn-primary w-full py-3 text-lg font-semibold rounded-lg cursor-pointer"
              type="submit"
              disabled={generating || !jobDescription}
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
          </form>
        </div>
        {/* Roadmap Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {roadmaps.length === 0 && (
            <div className="col-span-full text-center text-app-primary">
              No job description roadmaps found
            </div>
          )}
          {roadmaps.map((roadmapObj) => {
            const roadmap = parseRoadmapJson(roadmapObj.roadmap_json);
            return (
              <div
                key={roadmapObj.id}
                className="card bg-white border-2 border-app-primary rounded-xl shadow-md p-6 flex flex-col justify-between hover:shadow-xl transition-shadow duration-200"
              >
                <div>
                  <h3 className="font-bold text-lg text-app-primary mb-2 truncate">
                    {roadmapObj.title || roadmap.title || "Untitled Roadmap"}
                  </h3>
                  <div className="text-sm text-gray-500 gap-1 mb-4">
                    <span>Created: </span>
                    {roadmapObj.created_at
                      ? new Date(roadmapObj.created_at).toLocaleDateString()
                      : ""}
                  </div>
                  <div className="text-app-text text-sm line-clamp-3 mb-4">
                    {roadmapObj.job_description.slice(0, 120)}...
                  </div>
                </div>
                <div className="flex flex-col gap-2 mt-4">
                  <button
                    className="btn-primary px-4 py-2 rounded-md cursor-pointer w-full"
                    onClick={() => navigate(`/roadmaps/skill-gap-roadmap/${roadmapObj.id}`)}
                  >
                    View Roadmap
                  </button>
                  <button
                    className="btn-danger px-4 py-2 rounded-md cursor-pointer w-full"
                    onClick={() => handleDeleteRoadmap(roadmapObj.id)}
                    type="button"
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SkillGapRoadmap;