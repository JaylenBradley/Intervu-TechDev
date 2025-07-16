export const parseRoadmapJson = (raw) => {
  if (!raw) return null;
  try {
    if (typeof raw === "string") {
      const parsed = JSON.parse(raw);
      return Object.keys(parsed).length ? parsed : null;
    }
    if (typeof raw === "object" && raw !== null) {
      return Object.keys(raw).length ? raw : null;
    }
    return null;
  } catch {
    return null;
  }
};