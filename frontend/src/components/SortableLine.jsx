import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { INDENT_WIDTH } from "../utils/constants.js";

export default function SortableLine({ line, isWrong, highlightCorrect }) {
  const { setNodeRef, attributes, listeners, transform, transition, isDragging } =
    useSortable({ id: line.id, data: { indent: line.userIndent } });

  const left = line.userIndent * INDENT_WIDTH;

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        marginLeft: left,
        width: `calc(100% - ${left}px)`,
        opacity: isDragging ? 0.7 : 1,
      }}
      className={`flex items-center rounded p-2 cursor-grab select-none ${
        highlightCorrect ? "bg-green-100"
        : isWrong         ? "bg-red-200"
        : "bg-gray-100"
      }`}
    >
      <pre className="font-mono text-sm whitespace-pre overflow-x-auto">
        {line.text}
      </pre>
    </div>
  );
}
