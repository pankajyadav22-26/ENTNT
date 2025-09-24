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
  type DragEndEvent,
} from "@dnd-kit/core";
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
  if (!response.ok) throw new Error("Network response was not ok");
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
  if (!response.ok) throw new Error("Failed to reorder jobs");
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
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["jobs"] }),
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
      if (context?.previousJobs) {
        queryClient.setQueryData(["jobs", filters], context.previousJobs);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs", filters] });
    },
  });

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

  const handleFilterChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
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

  const handleToggleArchive = (job: Job) => {
    const newStatus = job.status === "active" ? "archived" : "active";
    archiveMutation.mutate({ id: job.id, status: newStatus });
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 text-gray-100">
      <h2 className="text-3xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-500">
        Manage Jobs
      </h2>

      <div className="mb-6">
        <button
          onClick={handleOpenCreateModal}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-medium shadow-lg shadow-blue-500/30 hover:opacity-90 transition-all"
        >
          + Create New Job
        </button>
      </div>

      <div className="mb-6 flex gap-4">
        <input
          type="text"
          name="title"
          placeholder="Search by title..."
          value={filters.title}
          onChange={handleFilterChange}
          className="w-1/2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 placeholder-gray-400 text-gray-200 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 backdrop-blur-md"
        />
        <select
          name="status"
          value={filters.status}
          onChange={handleFilterChange}
          className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-gray-200 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 backdrop-blur-md"
        >
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      {isLoading && (
        <div className="text-cyan-400 animate-pulse">Loading jobs...</div>
      )}
      {isError && (
        <div className="text-red-400">Error: Failed to load jobs</div>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={jobIds} strategy={verticalListSortingStrategy}>
          <div className="overflow-hidden rounded-2xl border border-white/10 backdrop-blur-md bg-white/5 shadow-xl">
            <table className="w-full text-left">
              <thead className="my-10 bg-white/10 border-b border-white/10">
                <tr>
                  <th className="px-6 py-3 text-sm font-semibold text-gray-300">
                    Title
                  </th>
                  <th className="px-6 py-3 text-sm font-semibold text-gray-300">
                    Status
                  </th>
                  <th className="px-6 py-3 text-sm font-semibold text-gray-300">
                    Tags
                  </th>
                  <th className="px-6 py-3 text-sm font-semibold text-gray-300">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((job) => (
                  <JobRow
                    key={job.id}
                    job={job}
                    onEdit={() => handleOpenEditModal(job)}
                    onToggleArchive={() => handleToggleArchive(job)}
                    isArchiving={
                      archiveMutation.isPending &&
                      archiveMutation.variables?.id === job.id
                    }
                  />
                ))}
              </tbody>
            </table>
          </div>
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
