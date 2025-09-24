import { useDroppable } from "@dnd-kit/core";
import type { ReactNode } from "react";

type Props = {
  id: string;
  title: string;
  children: ReactNode;
};

export function KanbanColumn({ id, title, children }: Props) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col rounded-xl min-h-[300px] w-72 overflow-hidden transition-all
        ${
          isOver
            ? "border-2 border-cyan-400 shadow-lg shadow-cyan-500/20"
            : "border border-gray-600/40"
        }
        bg-gray-100 dark:bg-gradient-to-b dark:from-gray-800 dark:to-gray-900
      `}
    >
      <div className="px-4 py-2 border-b border-gray-300 dark:border-gray-700 bg-gray-200/60 dark:bg-gray-800/80 sticky top-0 z-10">
        <h3 className="text-lg font-semibold capitalize text-gray-900 dark:text-gray-100">
          {title}
        </h3>
      </div>

      <div className="flex-1 p-3 space-y-3 overflow-y-auto">{children}</div>
    </div>
  );
}
