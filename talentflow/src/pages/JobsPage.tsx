import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Job } from "../lib/db";
import { JobModal } from "../components/JobModal";
import { JobRow } from "../components/JobRow";
import type { SubmitHandler } from "react-hook-form";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import type { DragEndEvent } from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

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

const reorderJobs = async (jobs: Job[]): Promise<{ success: boolean }> => {
  const payload = jobs.map((job, index) => ({
    id: job.id,
    order: index + 1,
  }));

  const response = await fetch("/jobs/reorder", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new Error("Failed to reorder jobs");
  }
  return response.json();
};

export function JobsPage() {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState({ title: "", status: "" });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [jobToEdit, setJobToEdit] = useState<Job | null>(null);

  const {
    data: jobs = [],
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

  const reorderMutation = useMutation({
    mutationFn: reorderJobs,
    onMutate: async (optimisticallyReorderedJobs) => {
      await queryClient.cancelQueries({ queryKey: ["jobs", filters] });
      const previousJobs = queryClient.getQueryData<Job[]>(["jobs", filters]);

      queryClient.setQueryData(["jobs", filters], optimisticallyReorderedJobs);

      return { previousJobs };
    },
    onError: (err, newJobs, context) => {
      alert("Failed to reorder. Rolling back.");
      if (context?.previousJobs) {
        queryClient.setQueryData(["jobs", filters], context.previousJobs);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs", filters] });
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

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = jobs.findIndex((j) => j.id === active.id);
      const newIndex = jobs.findIndex((j) => j.id === over.id);

      const reorderedData = arrayMove(jobs, oldIndex, newIndex);

      reorderMutation.mutate(reorderedData);
    }
  };

  const jobIds = jobs.map((j) => j.id);

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

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={jobIds} strategy={verticalListSortingStrategy}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #ccc", textAlign: "left" }}>
                <th>Title</th>
                <th>Status</th>
                <th>Tags</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((job) => (
                <JobRow
                  key={job.id}
                  job={job}
                  onEdit={handleOpenEditModal}
                  onToggleArchive={handleToggleArchive}
                  isArchiving={
                    archiveMutation.isPending &&
                    archiveMutation.variables?.id === job.id
                  }
                />
              ))}
            </tbody>
          </table>
        </SortableContext>
      </DndContext>

      <JobModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleModalSubmit}
        jobToEdit={jobToEdit}
      />
    </div>
  );
}
