import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useVirtualizer } from "@tanstack/react-virtual";
import { DndContext, type DragEndEvent } from "@dnd-kit/core";
import type { Candidate } from "../lib/db";
import { CandidateKanbanBoard } from "../components/CandidateKanbanBoard";

const fetchCandidates = async (filters: {
  search: string;
  stage: string;
}): Promise<Candidate[]> => {
  const params = new URLSearchParams();
  if (filters.search) params.append("search", filters.search);
  if (filters.stage) params.append("stage", filters.stage);

  const response = await fetch(`/candidates?${params.toString()}`);
  if (!response.ok) throw new Error("Failed to fetch candidates");
  return response.json();
};

const updateCandidateStage = async ({
  id,
  stage,
}: {
  id: string;
  stage: Candidate["stage"];
}): Promise<Candidate> => {
  const response = await fetch(`/candidates/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ stage }),
  });
  if (!response.ok) throw new Error("Failed to update candidate stage");
  return response.json();
};

export function CandidatesPage() {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState({ search: "", stage: "" });
  const [view, setView] = useState<"list" | "kanban">("list");

  const { data: candidates = [], isLoading } = useQuery({
    queryKey: ["candidates", filters],
    queryFn: () => fetchCandidates(filters),
  });

  const stageMutation = useMutation({
    mutationFn: updateCandidateStage,
    onMutate: async ({ id, stage }) => {
      await queryClient.cancelQueries({ queryKey: ["candidates", filters] });
      const previousCandidates = queryClient.getQueryData<Candidate[]>([
        "candidates",
        filters,
      ]);

      queryClient.setQueryData<Candidate[]>(["candidates", filters], (old) =>
        old?.map((c) => (c.id === id ? { ...c, stage } : c))
      );

      return { previousCandidates };
    },
    onError: (err, variables, context) => {
      alert("Failed to move candidate. Rolling back.");
      if (context?.previousCandidates) {
        queryClient.setQueryData(
          ["candidates", filters],
          context.previousCandidates
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["candidates", filters] });
    },
  });

  const handleFilterChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const activeCandidate = active.data.current?.candidate as Candidate;
      const newStage = over.id as Candidate["stage"];

      if (activeCandidate && activeCandidate.stage !== newStage) {
        stageMutation.mutate({ id: activeCandidate.id, stage: newStage });
      }
    }
  };

  const parentRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: candidates.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 50,
    overscan: 5,
  });

  return (
    <div>
      <h2>Manage Candidates</h2>

      <div
        style={{
          marginBottom: "1rem",
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <div>
          <button
            onClick={() => setView("list")}
            disabled={view === "list"}
            style={{ marginRight: "0.5rem" }}
          >
            List View
          </button>
          <button
            onClick={() => setView("kanban")}
            disabled={view === "kanban"}
          >
            Kanban View
          </button>
        </div>
      </div>

      <div style={{ marginBottom: "1rem", display: "flex", gap: "1rem" }}>
        <input
          type="text"
          name="search"
          placeholder="Search by name or email..."
          value={filters.search}
          onChange={handleFilterChange}
        />
        <select
          name="stage"
          value={filters.stage}
          onChange={handleFilterChange}
        >
          <option value="">All Stages</option>
          <option value="applied">Applied</option>
          <option value="screen">Screen</option>
          <option value="tech">Tech</option>
          <option value="offer">Offer</option>
          <option value="hired">Hired</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {isLoading && <div>Loading candidates...</div>}

      {view === "list" && !isLoading && (
        <div
          ref={parentRef}
          style={{
            height: "70vh",
            width: "90vh",
            overflow: "auto",
            border: "1px solid #ccc",
            borderRadius: "4px",
          }}
        >
          <div
            style={{
              height: `${rowVirtualizer.getTotalSize()}px`,
              width: "100%",
              position: "relative",
            }}
          >
            {rowVirtualizer.getVirtualItems().map((virtualItem) => {
              const candidate = candidates[virtualItem.index];
              return (
                <div
                  key={virtualItem.key}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: `${virtualItem.size}px`,
                    transform: `translateY(${virtualItem.start}px)`,
                    display: "flex",
                    alignItems: "center",
                    padding: "0 1rem",
                    borderBottom: "1px solid #eee",
                  }}
                >
                  <div style={{ flex: 1, fontWeight: "bold" }}>
                    {candidate.name}
                  </div>
                  <div style={{ flex: 1 }}>{candidate.email}</div>
                  <div style={{ flex: 1, textTransform: "capitalize" }}>
                    Stage: {candidate.stage}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {view === "kanban" && !isLoading && (
        <DndContext onDragEnd={handleDragEnd}>
          <CandidateKanbanBoard candidates={candidates} />
        </DndContext>
      )}
    </div>
  );
}
