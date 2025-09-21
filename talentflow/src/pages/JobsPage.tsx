import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Job } from "../lib/db";
import { JobModal } from "../components/JobModal";
import type { SubmitHandler } from "react-hook-form";
import { Link } from "react-router-dom";

const fetchJobs = async (filters: {
  title: string;
  status: string;
}): Promise<Job[]> => {
  const params = new URLSearchParams();
  if (filters.title) params.append("title", filters.title);
  if (filters.status) params.append("status", filters.status);

  const response = await fetch(`/jobs?${params.toString()}`);
  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  return response.json();
};

const updateJobStatus = async ({
  id,
  status,
}: {
  id: string;
  status: Job["status"];
}) => {
  const response = await fetch(`/jobs/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  if (!response.ok) throw new Error("Failed to update job status");
  return response.json();
};

type JobFormData = { title: string; slug: string };

const createJob = async (newJob: JobFormData): Promise<Job> => {
  const response = await fetch("/jobs", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(newJob),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to create job");
  }
  return response.json();
};

const updateJob = async ({
  id,
  ...updates
}: { id: string } & Partial<JobFormData>): Promise<Job> => {
  const response = await fetch(`/jobs/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to update job");
  }
  return response.json();
};

export function JobsPage() {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState({ title: "", status: "" });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [jobToEdit, setJobToEdit] = useState<Job | null>(null);

  const {
    data: jobs,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["jobs", filters],
    queryFn: () => fetchJobs(filters),
  });

  const archiveMutation = useMutation({
    mutationFn: updateJobStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
    },
  });

  const handleFilterChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleToggleArchive = (job: Job) => {
    const newStatus = job.status === "active" ? "archived" : "active";
    archiveMutation.mutate({ id: job.id, status: newStatus });
  };

  const createMutation = useMutation({
    mutationFn: createJob,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      setIsModalOpen(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateJob,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      setIsModalOpen(false);
      setJobToEdit(null);
    },
  });

  const handleOpenCreateModal = () => {
    setJobToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (job: Job) => {
    setJobToEdit(job);
    setIsModalOpen(true);
  };

  const handleModalSubmit: SubmitHandler<JobFormData> = (data) => {
    if (jobToEdit) {
      updateMutation.mutate({ id: jobToEdit.id, ...data });
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <div>
      <h2>Manage Jobs</h2>
      <div style={{ marginBottom: "1rem" }}>
        <button onClick={handleOpenCreateModal}>+ Create New Job</button>
      </div>

      <div style={{ marginBottom: "1rem", display: "flex", gap: "1rem" }}>
        <input
          type="text"
          name="title"
          placeholder="Search by title..."
          value={filters.title}
          onChange={handleFilterChange}
        />
        <select
          name="status"
          value={filters.status}
          onChange={handleFilterChange}
        >
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      {isLoading && <div>Loading jobs...</div>}
      {(isError ||
        archiveMutation.isError ||
        createMutation.isError ||
        updateMutation.isError) && (
        <div style={{ color: "red" }}>
          Error:{" "}
          {(createMutation.error || updateMutation.error)?.message ||
            "An error occurred"}
        </div>
      )}
      {jobs && (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead></thead>
          <tbody>
            {jobs.map((job) => (
              <tr
                key={job.id}
                style={{
                  borderBottom: "1px solid #eee",
                  opacity:
                    archiveMutation.isPending &&
                    archiveMutation.variables?.id === job.id
                      ? 0.5
                      : 1,
                }}
              >
                <td>
                  <Link to={`/jobs/${job.id}`}>{job.title}</Link>
                </td>
                <td style={{ padding: "0.5rem 0" }}>{job.title}</td>
                <td>{job.status}</td>
                <td>{job.tags.join(", ")}</td>
                <td>
                  <button onClick={() => handleOpenEditModal(job)}>Edit</button>
                  <button
                    style={{ marginLeft: "0.5rem" }}
                    onClick={() => handleToggleArchive(job)}
                    disabled={
                      archiveMutation.isPending &&
                      archiveMutation.variables?.id === job.id
                    }
                  >
                    {job.status === "active" ? "Archive" : "Unarchive"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <JobModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleModalSubmit}
        jobToEdit={jobToEdit}
      />
    </div>
  );
}
