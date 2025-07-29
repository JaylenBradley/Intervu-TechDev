import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchJobDescRoadmap, updateJobDescRoadmapTitle } from "../services/roadmapServices";
import { parseRoadmapJson } from "../utils/parseRoadmapJson.js";

const SkillGapRoadmapDetail = ({ user }) => {
  const [editingTitleId, setEditingTitleId] = useState(null);
  const [error, setError] = useState("");
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [roadmapObj, setRoadmapObj] = useState(null);
  const [titleError, setTitleError] = useState("");
  const [titleInput, setTitleInput] = useState("");
  const [titleLoading, setTitleLoading] = useState(false);
  const { id: roadmapId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (!user || !roadmapId) return;
    setLoading(true);
    setError("");
    fetchJobDescRoadmap(user.id, roadmapId)
      .then(setRoadmapObj)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [user, roadmapId]);

  const startEditTitle = (id, currentTitle) => {
    setEditingTitleId(id);
    setTitleInput(currentTitle);
    setTitleError("");
  };

  const cancelEditTitle = () => {
    setEditingTitleId(null);
    setTitleInput("");
    setTitleError("");
  };

  const saveTitle = async (id) => {
    if (!titleInput.trim()) {
      setTitleError("Title cannot be empty.");
      return;
    }
    setTitleLoading(true);
    setTitleError("");
    try {
      const updated = await updateJobDescRoadmapTitle(id, titleInput.trim());
      setRoadmapObj((prev) => ({ ...prev, title: updated.title }));
      setEditingTitleId(null);
      setTitleInput("");
    } catch (err) {
      setTitleError(err.message || "Failed to update title.");
    } finally {
      setTitleLoading(false);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loader-lg" />
      </div>
    );

  if (error) return <div className="text-red-600">{error}</div>;
  if (!roadmapObj) return <div className="text-app-primary">Roadmap not found.</div>;

  const roadmap = parseRoadmapJson(roadmapObj.roadmap_json);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <div className="bg-app-accent text-app-text border border-app-primary p-8 rounded-xl shadow-lg w-full max-w-4xl mt-16 mb-16">
        <button
          className="mb-4 btn-primary font-bold px-4 py-2 rounded-lg cursor-pointer"
          onClick={() => navigate("/roadmaps/skill-gap-roadmap")}
        >
          &larr; Back to Skill Gap Roadmaps
        </button>
        <div className="flex items-center justify-between mb-2">
          {editingTitleId === roadmapObj.id ? (
            <>
              <input
                className="border border-app-primary rounded px-2 py-1 w-100"
                value={titleInput}
                onChange={(e) => setTitleInput(e.target.value)}
                disabled={titleLoading}
                maxLength={100}
              />
              <div className="flex gap-2">
                <button
                  className="btn-danger rounded-md min-w-[87px] px-3 py-1 cursor-pointer"
                  onClick={cancelEditTitle}
                  disabled={titleLoading}
                  type="button"
                >
                  Cancel
                </button>
                <button
                  className="btn-primary rounded-md min-w-[87px] px-3 py-1 cursor-pointer"
                  onClick={() => saveTitle(roadmapObj.id)}
                  disabled={titleLoading}
                  type="button"
                >
                  {titleLoading ? "Saving..." : "Save"}
                </button>
              </div>
            </>
          ) : (
            <>
              <h3 className="text-app-primary font-bold text-xl truncate max-w-s">
                {roadmapObj.title || roadmap.title || "Untitled Roadmap"}
              </h3>
              <button
                className="btn-primary rounded-md min-w-[87px] px-3 py-1 cursor-pointer"
                onClick={() =>
                  startEditTitle(
                    roadmapObj.id,
                    roadmapObj.title || roadmap.title || "Untitled Roadmap"
                  )
                }
                type="button"
              >
                Edit Title
              </button>
            </>
          )}
        </div>
        {editingTitleId === roadmapObj.id && titleError && (
          <div className="text-red-600 mb-2">{titleError}</div>
        )}
        <div className="flex items-center justify-end mb-2">
          <button
            className="btn-primary rounded-md min-w-[87px] px-3 py-1 cursor-pointer"
            onClick={() => setExpanded((prev) => !prev)}
            type="button"
          >
            {expanded ? "Hide Job Description" : "Show Job Description"}
          </button>
        </div>
        {expanded && (
          <pre className="bg-gray-100 p-2 rounded mb-4 whitespace-pre-wrap">
            {roadmapObj.job_description}
          </pre>
        )}
        {roadmap.specific_goals && (
          <>
            <h4 className="font-semibold mt-1 mb-2">Specific Goals</h4>
            <ul className="list-disc ml-6">
              {roadmap.specific_goals.map((goal, i) => (
                <li key={i}>{goal}</li>
              ))}
            </ul>
          </>
        )}
        {roadmap.roadmap && (
          <>
            <h4 className="font-semibold mt-4 mb-2">Step-by-Step Roadmap</h4>
            <ul className="list-disc ml-6">
              {roadmap.roadmap.map((step, i) => (
                <li key={i}>{step}</li>
              ))}
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
                  {(roadmap.skills.technical || []).map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>
              <div>
                <strong>Soft:</strong>
                <ul className="list-disc ml-6">
                  {(roadmap.skills.soft || []).map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
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
            <h4 className="font-semibold mt-4 mb-2">
              Job Titles You Can Apply For
            </h4>
            <ul className="list-disc ml-6">
              {roadmap.job_titles.map((title, i) => (
                <li key={i}>{title}</li>
              ))}
            </ul>
          </>
        )}
        {roadmap.resource_links && (
          <>
            <h4 className="font-semibold mt-4 mb-2">Resource Links</h4>
            {Object.entries(roadmap.resource_links).map(
              ([cat, items]) =>
                items &&
                items.length > 0 && (
                  <div key={cat} className="mb-2">
                    <strong className="capitalize">{cat}:</strong>
                    <ul className="list-disc ml-6">
                      {items.map((item, i) => (
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
                  </div>
                )
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SkillGapRoadmapDetail;