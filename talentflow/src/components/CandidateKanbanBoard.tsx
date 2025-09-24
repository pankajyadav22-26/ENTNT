import type { Candidate } from "../lib/db";
import { CandidateCard } from "./CandidateCard";
import { KanbanColumn } from "./KanbanColumn";

type Props = {
  candidates: Candidate[];
  activeCandidateId?: string | null;
};

const STAGES = [
  "applied",
  "screen",
  "tech",
  "offer",
  "hired",
  "rejected",
] as const;

export function CandidateKanbanBoard({ candidates, activeCandidateId }: Props) {
  const candidatesByStage = STAGES.reduce((acc, stage) => {
    acc[stage] = candidates.filter((c) => c.stage === stage);
    return acc;
  }, {} as Record<(typeof STAGES)[number], Candidate[]>);

  return (
    <div className="grid grid-cols-6 gap-75 w-full p-1 overflow-x-auto">
      {STAGES.map((stage) => (
        <KanbanColumn key={stage} id={stage} title={stage}>
          {candidatesByStage[stage].map((candidate) => (
            <CandidateCard
              key={candidate.id}
              candidate={candidate}
              isDragging={activeCandidateId === candidate.id}
            />
          ))}
        </KanbanColumn>
      ))}
    </div>
  );
}
