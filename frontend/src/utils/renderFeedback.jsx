export const renderFeedback = (feedback) => {
  let data;
  try {
    data = typeof feedback === "string" ? JSON.parse(feedback) : feedback;
  } catch {
    return <div>{feedback}</div>;
  }
  return (
    <div>
      <h4 className="font-bold mb-2">Structure</h4>
      <ul className="list-disc ml-6">
        <li>STAR Used: {data.structure?.star_used === true ? "Yes" : data.structure?.star_used === false ? "No" : ""}</li>
        <li>
          Missing Parts: {Array.isArray(data.structure?.missing_parts) && data.structure.missing_parts.length > 0
            ? <ul className="list-disc ml-6">{data.structure.missing_parts.map((p, i) => <li key={i}>{p}</li>)}</ul>
            : "None"}
        </li>
        {data.structure?.notes && data.structure.notes.trim() && (
          <li>Notes: {data.structure.notes}</li>
        )}
      </ul>
      <h4 className="font-bold mt-3 mb-2">Content</h4>
      <ul className="list-disc ml-6">
        <li>Relevance: {data.content?.relevance === true ? "Yes" : data.content?.relevance === false ? "No" : ""}</li>
        <li>
          Strengths: {Array.isArray(data.content?.strengths) && data.content.strengths.length > 0
            ? <ul className="list-disc ml-6">{data.content.strengths.map((s, i) => <li key={i}>{s}</li>)}</ul>
            : "None"}
        </li>
        <li>
          Weaknesses: {Array.isArray(data.content?.weaknesses) && data.content.weaknesses.length > 0
            ? <ul className="list-disc ml-6">{data.content.weaknesses.map((w, i) => <li key={i}>{w}</li>)}</ul>
            : "None"}
        </li>
      </ul>
      <h4 className="font-bold mt-3 mb-2">Tone</h4>
      <ul className="list-disc ml-6">
        <li>Confident: {data.tone?.confident === true ? "Yes" : data.tone?.confident === false ? "No" : ""}</li>
        <li>
          Issues: {Array.isArray(data.tone?.issues) && data.tone.issues.length > 0
            ? <ul className="list-disc ml-6">{data.tone.issues.map((issue, i) => <li key={i}>{issue}</li>)}</ul>
            : "None"}
        </li>
        <li>Pauses: {data.tone?.pauses || "No speech analysis available"}</li>
        {data.tone?.notes && data.tone.notes.trim() && (
          <li>Notes: {data.tone.notes}</li>
        )}
      </ul>
      <h4 className="font-bold mt-3 mb-2">Overall Assessment</h4>
      <div>{data.overall_assessment}</div>
      <h4 className="font-bold mt-3 mb-2">Suggestions</h4>
      <ul className="list-disc ml-6">
        {Array.isArray(data.suggestions) && data.suggestions.length > 0
          ? data.suggestions.map((s, i) => <li key={i}>{s}</li>)
          : <li>None</li>}
      </ul>
    </div>
  );
}