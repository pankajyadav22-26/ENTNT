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
  const typePath = `sections.${sectionIndex}.questions.${questionIndex}.type`;
  const validationPath = `sections.${sectionIndex}.questions.${questionIndex}.validation`;
  const questionType = watch(typePath);

  return (
    <div
      style={{
        border: "1px solid #ddd",
        padding: "1rem",
        marginBottom: "1rem",
        borderRadius: "4px",
        backgroundColor: "#fdfdfd",
      }}
    >
      <button type="button" onClick={onRemove} style={{ float: "right" }}>
        X
      </button>
      <input
        placeholder="Question Title"
        {...register(
          `sections.${sectionIndex}.questions.${questionIndex}.title`,
          { required: true }
        )}
        style={{ width: "90%", marginBottom: "0.5rem", fontWeight: "bold" }}
      />
      <select {...register(typePath)} style={{ marginBottom: "0.5rem" }}>
        <option value="short-text">Short Text</option>
        <option value="long-text">Long Text</option>
        <option value="numeric">Numeric</option>
        <option value="single-choice">Single Choice</option>
        <option value="multi-choice">Multiple Choice</option>
        <option value="file-upload">File Upload</option>
      </select>

      <div
        style={{
          fontSize: "0.9rem",
          display: "flex",
          gap: "1rem",
          alignItems: "center",
        }}
      >
        <label>
          <input type="checkbox" {...register(`${validationPath}.required`)} />{" "}
          Required
        </label>

        {questionType === "numeric" && (
          <>
            <input
              type="number"
              placeholder="Min Value"
              {...register(`${validationPath}.min`, { valueAsNumber: true })}
            />
            <input
              type="number"
              placeholder="Max Value"
              {...register(`${validationPath}.max`, { valueAsNumber: true })}
            />
          </>
        )}
      </div>
    </div>
  );
}
