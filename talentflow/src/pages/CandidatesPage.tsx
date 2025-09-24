import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useVirtualizer } from "@tanstack/react-virtual";
import {
  DndContext,
  type DragEndEvent,
  type DragStartEvent,
  DragOverlay,
} from "@dnd-kit/core";
import type { Candidate } from "../lib/db";
import { CandidateKanbanBoard } from "../components/CandidateKanbanBoard";
import { CandidateCard } from "../components/CandidateCard";
import { Link } from "react-router-dom";

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

  const [activeCandidate, setActiveCandidate] = useState<Candidate | null>(
    null
  );

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

  const handleDragStart = (event: DragStartEvent) => {
    const candidate = event.active.data.current?.candidate as Candidate;
    if (candidate) {
      setActiveCandidate(candidate);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveCandidate(null);
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
    estimateSize: () => 64,
    overscan: 5,
  });

  return (
    <div className="p-6 min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-950 text-white">
      <h2 className="text-3xl font-bold mb-6 text-cyan-400 drop-shadow-lg">
        Manage Candidates
      </h2>

      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-2">
          <button
            onClick={() => setView("list")}
            disabled={view === "list"}
            className={`px-4 py-2 rounded-xl backdrop-blur-md ${
              view === "list"
                ? "bg-cyan-500/30 text-cyan-300"
                : "bg-white/5 hover:bg-white/10"
            }`}
          >
            List View
          </button>
          <button
            onClick={() => setView("kanban")}
            disabled={view === "kanban"}
            className={`px-4 py-2 rounded-xl backdrop-blur-md ${
              view === "kanban"
                ? "bg-cyan-500/30 text-cyan-300"
                : "bg-white/5 hover:bg-white/10"
            }`}
          >
            Kanban View
          </button>
        </div>
      </div>

      <div className="flex gap-3 mb-6">
        <input
          type="text"
          name="search"
          placeholder="Search by name or email..."
          value={filters.search}
          onChange={handleFilterChange}
          className="flex-1 px-4 py-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 focus:border-cyan-400 outline-none"
        />
        <select
          name="stage"
          value={filters.stage}
          onChange={handleFilterChange}
          className="px-4 py-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 focus:border-cyan-400 outline-none"
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

      {isLoading && <div className="text-gray-400">Loading candidates...</div>}

      {view === "list" && !isLoading && (
        <div
          ref={parentRef}
          className="h-[70vh] w-full overflow-auto rounded-xl border border-white/10 bg-white/5 backdrop-blur-lg shadow-xl"
        >
          <div
            style={{
              height: `${rowVirtualizer.getTotalSize()}px`,
              position: "relative",
            }}
          >
            {rowVirtualizer.getVirtualItems().map((virtualItem) => {
              const candidate = candidates[virtualItem.index];
              if (!candidate) return null;
              return (
                <div
                  key={virtualItem.key}
                  style={{
                    transform: `translateY(${virtualItem.start}px)`,
                    height: `${virtualItem.size}px`,
                  }}
                  className="absolute top-0 left-0 right-0 flex items-center px-4 border-b border-white/10 hover:bg-white/10 transition"
                >
                  <div className="flex-1 font-semibold text-cyan-300 hover:underline">
                    <Link to={`/candidates/${candidate.id}`}>
                      {candidate.name}
                    </Link>
                  </div>
                  <div className="flex-1 text-gray-300">{candidate.email}</div>
                  <div className="flex-1 capitalize text-sm text-gray-400">
                    Stage: {candidate.stage}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {view === "kanban" && !isLoading && (
        <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <CandidateKanbanBoard
            candidates={candidates}
            activeCandidateId={activeCandidate?.id}
          />

          <DragOverlay>
            {activeCandidate ? (
              <CandidateCard candidate={activeCandidate} isOverlay />
            ) : null}
          </DragOverlay>
        </DndContext>
      )}
    </div>
  );
}
