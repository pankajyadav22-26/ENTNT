import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import type { Job } from "../lib/db";
import { Briefcase, Tag, Settings, ArrowLeft } from "lucide-react";

const fetchJobById = async (id: string): Promise<Job> => {
  const response = await fetch(`/jobs/${id}`);
  if (!response.ok) {
    throw new Error("Job not found");
  }
  return response.json();
};

export function JobDetailPage() {
  const { jobId } = useParams<{ jobId: string }>();

  const {
    data: job,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["job", jobId],
    queryFn: () => fetchJobById(jobId!),
    enabled: !!jobId,
  });

  if (isLoading)
    return <div className="text-gray-400">Loading job details...</div>;
  if (isError) return <div className="text-red-400">Error loading job.</div>;
  if (!job) return <div className="text-gray-400">Job not found.</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-950 text-white p-8">
      <Link
        to="/jobs"
        className="inline-flex items-center text-gray-400 hover:text-cyan-400 transition mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Jobs List
      </Link>

      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-lg shadow-xl mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Briefcase className="w-7 h-7 text-cyan-400" />
          {job.title}
        </h1>
        <p className="mt-3 text-gray-300">
          <strong>Status:</strong>{" "}
          <span className="capitalize text-cyan-300">{job.status}</span>
        </p>
        <p className="mt-2 text-gray-300 flex items-center gap-2">
          <Tag className="w-5 h-5 text-cyan-400" />
          <span>{job.tags.join(", ") || "No tags"}</span>
        </p>
        <p className="mt-2 text-gray-400 text-sm">
          <strong>Internal ID:</strong> {job.id}
        </p>
        <p className="text-gray-400 text-sm">
          <strong>Slug:</strong> /careers/{job.slug}
        </p>
      </div>

      <div className="flex gap-4">
        <Link to={`/jobs/${jobId}/apply`}>
          <button className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-600 text-white font-medium shadow-md transition">
            Apply Now
          </button>
        </Link>
        <Link to={`/jobs/${jobId}/assessment`}>
          <button className="px-5 py-2 rounded-xl bg-white/10 border border-white/10 hover:bg-white/20 text-gray-200 transition flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Edit Assessment
          </button>
        </Link>
      </div>
    </div>
  );
}
