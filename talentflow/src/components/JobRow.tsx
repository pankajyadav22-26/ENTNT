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
    opacity: isDragging ? 0.6 : 1,
  };

  return (
    <tr
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`transition-colors ${
        isDragging
          ? "bg-cyan-500/10 shadow-lg shadow-cyan-500/20"
          : "hover:bg-white/5"
      }`}
    >
      <td className="px-6 py-4 text-gray-200 font-medium">
        <Link
          to={`/jobs/${job.id}`}
          className="hover:text-cyan-400 transition-colors"
        >
          {job.title}
        </Link>
      </td>

      <td className="px-6 py-4">
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold tracking-wide border shadow-sm ${
            job.status === "active"
              ? "bg-green-500/10 border-green-500/30 text-green-400"
              : "bg-gray-600/20 border-gray-500/30 text-gray-400"
          }`}
        >
          {job.status}
        </span>
      </td>

      <td className="px-6 py-4 text-sm text-gray-300">
        {job.tags.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {job.tags.map((tag, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 rounded-md border border-purple-400/30 bg-purple-500/10 text-purple-300 text-xs shadow-sm"
              >
                {tag}
              </span>
            ))}
          </div>
        ) : (
          <span className="text-gray-500 italic">No tags</span>
        )}
      </td>

      <td className="px-6 py-4 flex gap-2">
        <button
          onClick={() => onEdit(job)}
          className="px-3 py-1 rounded-md border border-blue-400/30 bg-blue-500/10 text-blue-300 hover:bg-blue-500/20 hover:scale-105 transition"
        >
          Edit
        </button>
        <button
          onClick={() => onToggleArchive(job)}
          disabled={isArchiving}
          className={`px-3 py-1 rounded-md border transition hover:scale-105 ${
            job.status === "active"
              ? "border-red-400/30 bg-red-500/10 text-red-300 hover:bg-red-500/20"
              : "border-yellow-400/30 bg-yellow-500/10 text-yellow-300 hover:bg-yellow-500/20"
          } ${
            isArchiving ? "opacity-50 cursor-not-allowed hover:scale-100" : ""
          }`}
        >
          {job.status === "active" ? "Archive" : "Unarchive"}
        </button>
      </td>
    </tr>
  );
}
