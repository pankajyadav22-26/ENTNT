import { useDraggable } from "@dnd-kit/core";
import type { Candidate } from "../lib/db";

type Props = {
  candidate: Candidate;
};

export function CandidateCard({ candidate }: Props) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: candidate.id,
    data: { candidate },
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        padding: "0.75rem",
        border: "1px solid #ccc",
        borderRadius: "4px",
        backgroundColor: "white",
        marginBottom: "0.5rem",
        cursor: "grab",
      }}
      {...listeners}
      {...attributes}
    >
      <strong>{candidate.name}</strong>
      <div style={{ fontSize: "0.8rem", color: "#555" }}>{candidate.email}</div>
    </div>
  );
}
