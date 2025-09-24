import { useDraggable } from "@dnd-kit/core";
import type { Candidate } from "../lib/db";
import { Link } from "react-router-dom";

type Props = {
  candidate: Candidate;
  isOverlay?: boolean;
  isDragging?: boolean;
};

export function CandidateCard({ candidate, isOverlay, isDragging }: Props) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: candidate.id,
    data: { candidate },
  });

  const style =
    transform && !isOverlay
      ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
      : undefined;

  if (isDragging) {
    return <div ref={setNodeRef} style={{ ...style, visibility: "hidden" }} />;
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`p-4 mb-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-lg shadow-md transition-transform hover:scale-[1.02] ${
        isOverlay ? "cursor-grabbing" : "cursor-grab active:cursor-grabbing"
      }`}
      {...listeners}
      {...attributes}
    >
      <Link
        to={`/candidates/${candidate.id}`}
        className="block no-underline text-gray-100"
      >
        <p className="font-semibold text-lg">{candidate.name}</p>
        <p className="text-sm text-gray-400">{candidate.email}</p>
      </Link>
    </div>
  );
}
