import { useFormContext, useFieldArray } from "react-hook-form";

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
  const questionType = watch(
    `sections.${sectionIndex}.questions.${questionIndex}.type`
  );

  return (
    <div
      style={{
        border: "1px solid #ddd",
        padding: "1rem",
        marginBottom: "1rem",
        borderRadius: "4px",
      }}
    >
      <input
        placeholder="Question Title"
        {...register(
          `sections.${sectionIndex}.questions.${questionIndex}.title`,
          { required: true }
        )}
        style={{ width: "100%", marginBottom: "0.5rem" }}
      />
      <select
        {...register(
          `sections.${sectionIndex}.questions.${questionIndex}.type`
        )}
        style={{ marginBottom: "0.5rem" }}
      >
        <option value="short-text">Short Text</option>
        <option value="long-text">Long Text</option>
        <option value="single-choice">Single Choice</option>
        <option value="multi-choice">Multiple Choice</option>
      </select>

      {(questionType === "single-choice" ||
        questionType === "multi-choice") && (
        <div>
          <p style={{ color: "#888" }}>Option management UI would go here.</p>
        </div>
      )}

      <button type="button" onClick={onRemove}>
        Remove Question
      </button>
    </div>
  );
}
