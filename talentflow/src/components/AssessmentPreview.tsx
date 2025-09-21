import { useFormContext } from "react-hook-form";
import type { Section } from "../lib/db";

export function AssessmentPreview() {
  const { watch } = useFormContext();
  const sections: Section[] = watch("sections") || [];

  return (
    <div
      style={{
        border: "1px solid #ccc",
        padding: "1rem",
        backgroundColor: "#f9f9f9",
        borderRadius: "4px",
      }}
    >
      <h3 style={{ marginTop: 0 }}>Live Preview</h3>
      {sections.map((section) => (
        <div key={section.id} style={{ marginBottom: "1.5rem" }}>
          <h4>{section.title || "Section Title"}</h4>
          {section.questions.map((question) => (
            <div key={question.id} style={{ marginBottom: "1rem" }}>
              <label>{question.title || "Question Title"}</label>
              {question.type === "short-text" && (
                <input type="text" disabled style={{ width: "100%" }} />
              )}
              {question.type === "long-text" && (
                <textarea disabled style={{ width: "100%" }} />
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
