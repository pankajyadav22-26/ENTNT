import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Job } from "../lib/db";
import { Link } from "react-router-dom";

type JobRowProps = {
  job: Job;
  onEdit: (job: Job) => void;
  onToggleArchive: (job: Job) => void;
  isArchiving: boolean;
};

export function JobRow({
  job,
  onEdit,
  onToggleArchive,
  isArchiving,
}: JobRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: job.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <tr ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <td style={{ padding: "0.5rem 0" }}>
        <Link to={`/jobs/${job.id}`}>{job.title}</Link>
      </td>
      <td>{job.status}</td>
      <td>{job.tags.join(", ")}</td>
      <td>
        <button onClick={() => onEdit(job)}>Edit</button>
        <button
          style={{ marginLeft: "0.5rem" }}
          onClick={() => onToggleArchive(job)}
          disabled={isArchiving}
        >
          {job.status === "active" ? "Archive" : "Unarchive"}
        </button>
      </td>
    </tr>
  );
}
