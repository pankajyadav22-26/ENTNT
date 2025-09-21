import type { Candidate } from "../lib/db";
import { CandidateCard } from "./CandidateCard";
import { KanbanColumn } from "./KanbanColumn";

type Props = {
  candidates: Candidate[];
};

const STAGES = [
  "applied",
  "screen",
  "tech",
  "offer",
  "hired",
  "rejected",
] as const;

export function CandidateKanbanBoard({ candidates }: Props) {
  const candidatesByStage = STAGES.reduce((acc, stage) => {
    acc[stage] = candidates.filter((c) => c.stage === stage);
    return acc;
  }, {} as Record<(typeof STAGES)[number], Candidate[]>);

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(6, 1fr)",
        gap: "1rem",
      }}
    >
      {STAGES.map((stage) => (
        <KanbanColumn key={stage} id={stage} title={stage}>
          {candidatesByStage[stage].map((candidate) => (
            <CandidateCard key={candidate.id} candidate={candidate} />
          ))}
        </KanbanColumn>
      ))}
    </div>
  );
}
