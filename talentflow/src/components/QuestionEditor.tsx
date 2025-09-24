import { useFormContext } from "react-hook-form";

type Props = {
  sectionIndex: number;
  questionIndex: number;
  onRemove: () => void;
};

export function QuestionEditor({
  sectionIndex,
  questionIndex,
  onRemove,
}: Props) {
  const { register, watch } = useFormContext();
  const typePath = `sections.${sectionIndex}.questions.${questionIndex}.type`;
  const validationPath = `sections.${sectionIndex}.questions.${questionIndex}.validation`;
  const questionType = watch(typePath);

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
        {...register(
          `sections.${sectionIndex}.questions.${questionIndex}.title`,
          { required: true }
        )}
        className="w-full mb-3 px-3 py-2 font-semibold rounded-lg 
          border border-gray-300/40 dark:border-gray-600/50 
          bg-white/70 dark:bg-gray-700/70 
          focus:outline-none focus:ring-2 focus:ring-cyan-500 
          dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
      />
      <select
        {...register(typePath)}
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
      <div className="flex flex-wrap gap-4 items-center text-sm text-gray-700 dark:text-gray-300">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            {...register(`${validationPath}.required`)}
            className="w-4 h-4 rounded accent-cyan-500"
          />
          <span>Required</span>
        </label>

        {questionType === "numeric" && (
          <>
            <input
              type="number"
              placeholder="Min"
              {...register(`${validationPath}.min`, { valueAsNumber: true })}
              className="w-24 px-2 py-1 rounded-lg border border-gray-300/40 
                dark:border-gray-600/50 bg-white/70 dark:bg-gray-700/70 
                focus:outline-none focus:ring-2 focus:ring-cyan-500 
                dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
            />
            <input
              type="number"
              placeholder="Max"
              {...register(`${validationPath}.max`, { valueAsNumber: true })}
              className="w-24 px-2 py-1 rounded-lg border border-gray-300/40 
                dark:border-gray-600/50 bg-white/70 dark:bg-gray-700/70 
                focus:outline-none focus:ring-2 focus:ring-cyan-500 
                dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
            />
          </>
        )}
      </div>
    </div>
  );
}
