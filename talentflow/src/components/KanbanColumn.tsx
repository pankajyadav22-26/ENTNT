// src/components/KanbanColumn.tsx
import { useDroppable } from "@dnd-kit/core";
import type { ReactNode } from "react";

type Props = {
  id: string;
  title: string;
  children: ReactNode;
};

export function KanbanColumn({ id, title, children }: Props) {
  const { setNodeRef, isOver } = useDroppable({
    id: id,
  });

  const style = {
    backgroundColor: isOver ? "#e0e0e0" : "#f4f4f4",
    padding: "1rem",
    borderRadius: "4px",
    minHeight: "200px",
  };

  return (
    <div ref={setNodeRef} style={style}>
      <h3 style={{ marginTop: 0, textTransform: "capitalize" }}>{title}</h3>
      {children}
    </div>
  );
}
