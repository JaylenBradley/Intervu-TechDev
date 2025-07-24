export const INDENT_WIDTH = 48;
export const MAX_INDENT   = 4;

export const COMPLEXITIES = [
  "O(1)", "O(log n)", "O(n)", "O(n log n)", "O(n^2)",
  "O(n^3)", "O(2^n)", "O(n!)",
];

export const APPROACHES = [
  "Two Pointers", "Sliding Window", "Binary Search", "BFS",
  "Dynamic Programming", "Backtracking", "Tree", "Greedy",
  "Topological Sort", "Graph", "Heap", "Stack", "Intervals",
  "Linked List", "Array & Hashing",
];

export const diffClasses = {
  Easy:   "bg-green-100 text-green-800",
  Medium: "bg-yellow-100 text-yellow-800",
  Hard:   "bg-red-100 text-red-800",
};

export const genId = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);

export const toLines = (problem) =>
  problem.solution
    .map((l, idx) => ({
      id: genId(),
      order: idx,
      text: l.text.trimStart(),
      indentLevel: l.indentLevel,
      userIndent: l.indentLevel   
    }))
    .sort(() => Math.random() - 0.5);
