import { useFormContext } from "react-hook-form";
import type { Question } from "../lib/db";
import { useEffect } from "react";

type Props = {
  sectionIndex: number;
  questionIndex: number;
  onRemove: () => void;
  availableQuestions: Question[];
};

export function QuestionEditor({
  sectionIndex,
  questionIndex,
  onRemove,
  availableQuestions,
}: Props) {
  const { register, watch, setValue } = useFormContext();
  const baseName = `sections.${sectionIndex}.questions.${questionIndex}`;
  const questionType = watch(`${baseName}.type`);

  const isConditional = watch(`${baseName}.isConditional`);

  useEffect(() => {
    if (!isConditional) {
      setValue(`${baseName}.conditional.questionId`, "");
      setValue(`${baseName}.conditional.value`, "");
    }
  }, [isConditional, setValue, baseName]);

  return (
    <div
      className="relative rounded-xl p-5 mb-6 backdrop-blur-md 
      bg-white/60 dark:bg-gray-800/70 border border-gray-300/40 
      dark:border-gray-700/50 shadow-md hover:shadow-lg transition-all"
    >
      <button
        type="button"
        onClick={onRemove}
        className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center 
          rounded-full bg-red-500/20 hover:bg-red-500/30 text-red-400 
          hover:text-red-300 font-bold transition"
      >
        ✕
      </button>
      <input
        placeholder="Question Title"
        {...register(`${baseName}.title`, { required: true })}
        className="w-full mb-3 px-3 py-2 font-semibold rounded-lg 
          border border-gray-300/40 dark:border-gray-600/50 
          bg-white/70 dark:bg-gray-700/70 
          focus:outline-none focus:ring-2 focus:ring-cyan-500 
          dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
      />
      <select
        {...register(`${baseName}.type`)}
        className="w-full mb-4 px-3 py-2 rounded-lg border border-gray-300/40 
          dark:border-gray-600/50 bg-white/70 dark:bg-gray-700/70 
          focus:outline-none focus:ring-2 focus:ring-cyan-500 
          dark:text-gray-100"
      >
        <option value="short-text">Short Text</option>
        <option value="long-text">Long Text</option>
        <option value="numeric">Numeric</option>
        <option value="single-choice">Single Choice</option>
        <option value="multi-choice">Multiple Choice</option>
        <option value="file-upload">File Upload</option>
      </select>

      <div className="flex flex-wrap gap-4 items-center text-sm text-gray-700 dark:text-gray-300 pb-4 border-b border-gray-300/40 dark:border-gray-700/50">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            {...register(`${baseName}.validation.required`)}
            className="w-4 h-4 rounded accent-cyan-500"
          />
          <span>Required</span>
        </label>
        {questionType === "numeric" && (
          <>
            <input
              type="number"
              placeholder="Min"
              {...register(`${baseName}.validation.min`, {
                valueAsNumber: true,
              })}
              className="w-24 px-2 py-1 rounded-lg border border-gray-300/40 dark:border-gray-600/50 bg-white/70 dark:bg-gray-700/70 focus:outline-none focus:ring-2 focus:ring-cyan-500 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
            />
            <input
              type="number"
              placeholder="Max"
              {...register(`${baseName}.validation.max`, {
                valueAsNumber: true,
              })}
              className="w-24 px-2 py-1 rounded-lg border border-gray-300/40 dark:border-gray-600/50 bg-white/70 dark:bg-gray-700/70 focus:outline-none focus:ring-2 focus:ring-cyan-500 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
            />
          </>
        )}
      </div>

      {availableQuestions.length > 0 && (
        <div className="pt-4 text-sm text-gray-700 dark:text-gray-300">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              {...register(`${baseName}.isConditional`)}
              className="w-4 h-4 rounded accent-cyan-500"
            />
            <span>Conditional Logic</span>
          </label>

          {isConditional && (
            <div className="mt-3 flex flex-wrap items-center gap-2 bg-gray-200/50 dark:bg-gray-900/50 p-3 rounded-lg">
              <span>Show this question if</span>
              <select
                {...register(`${baseName}.conditional.questionId`)}
                className="px-2 py-1 rounded-lg border border-gray-300/40 dark:border-gray-600/50 bg-white/70 dark:bg-gray-700/70 focus:outline-none focus:ring-2 focus:ring-cyan-500 dark:text-gray-100"
              >
                <option value="">Select a question...</option>
                {availableQuestions.map((q) => (
                  <option key={q.id} value={q.id}>
                    {q.title || `(Untitled Question)`}
                  </option>
                ))}
              </select>
              <span>is equal to</span>
              <input
                type="text"
                placeholder="e.g., Yes"
                {...register(`${baseName}.conditional.value`)}
                className="w-24 px-2 py-1 rounded-lg border border-gray-300/40 dark:border-gray-600/50 bg-white/70 dark:bg-gray-700/70 focus:outline-none focus:ring-2 focus:ring-cyan-500 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}