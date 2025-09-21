import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import type { Job } from "../lib/db";

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

  if (isLoading) return <div>Loading job details...</div>;
  if (isError) return <div>Error loading job.</div>;
  if (!job) return <div>Job not found.</div>;

  return (
    <div>
      <Link to="/jobs">&larr; Back to Jobs List</Link>
      <h1>{job.title}</h1>
      <p>
        <strong>Status:</strong> {job.status}
      </p>
      <p>
        <strong>Tags:</strong> {job.tags.join(", ")}
      </p>
      <p>
        <strong>Internal ID:</strong> {job.id}
      </p>
      <p>
        <strong>Slug:</strong> /careers/{job.slug}
      </p>
    </div>
  );
}
