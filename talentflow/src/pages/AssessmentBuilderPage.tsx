import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  useForm,
  useFieldArray,
  FormProvider,
  useFormContext,
} from "react-hook-form";
import type { Assessment, Section, Question } from "../lib/db";
import { v4 as uuidv4 } from "uuid";
import { QuestionEditor } from "../components/QuestionEditor";
import { AssessmentPreview } from "../components/AssessmentPreview";
import { useEffect } from "react";

const fetchAssessment = async (jobId: string): Promise<Assessment> => {
  const res = await fetch(`/assessments/${jobId}`);
  if (!res.ok) throw new Error("Failed to fetch assessment");
  return res.json();
};

const saveAssessment = async (
  assessmentData: Assessment
): Promise<Assessment> => {
  const res = await fetch(`/assessments/${assessmentData.jobId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(assessmentData),
  });
  if (!res.ok) throw new Error("Failed to save assessment");
  return res.json();
};

export function AssessmentBuilderPage() {
  const { jobId } = useParams<{ jobId: string }>();
  const queryClient = useQueryClient();

  const { data: assessmentData, isLoading } = useQuery({
    queryKey: ["assessment", jobId],
    queryFn: () => fetchAssessment(jobId!),
    enabled: !!jobId,
  });

  const mutation = useMutation({
    mutationFn: saveAssessment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assessment", jobId] });
      alert("Assessment saved!");
    },
  });

  const methods = useForm<Assessment>();
  const { control, handleSubmit, reset } = methods;

  const {
    fields: sections,
    append: appendSection,
    remove: removeSection,
  } = useFieldArray({
    control,
    name: "sections",
  });

  useEffect(() => {
    if (assessmentData) {
      reset(assessmentData);
    }
  }, [assessmentData, reset]);

  if (isLoading) return <div>Loading Assessment Builder...</div>;

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit((data) => mutation.mutate(data))}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h2>Assessment Builder for Job ID: {jobId}</h2>
          <button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? "Saving..." : "Save Assessment"}
          </button>
        </div>
        <Link to={`/jobs/${jobId}`}>&larr; Back to Job Details</Link>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "2rem",
            marginTop: "1rem",
          }}
        >
          <div>
            {sections.map((section, sectionIndex) => (
              <div
                key={section.id}
                style={{
                  border: "1px solid #ccc",
                  padding: "1rem",
                  marginBottom: "1rem",
                  borderRadius: "4px",
                }}
              >
                <input
                  {...control.register(`sections.${sectionIndex}.title`)}
                  placeholder="Section Title"
                  style={{ fontSize: "1.2rem", marginBottom: "1rem" }}
                />
                <QuestionsForSection sectionIndex={sectionIndex} />
                <button
                  type="button"
                  onClick={() => removeSection(sectionIndex)}
                >
                  Remove Section
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() =>
                appendSection({ id: uuidv4(), title: "", questions: [] })
              }
            >
              + Add Section
            </button>
          </div>

          <AssessmentPreview />
        </div>
      </form>
    </FormProvider>
  );
}

function QuestionsForSection({ sectionIndex }: { sectionIndex: number }) {
  const { control } = useFormContext();
  const { fields, append, remove } = useFieldArray({
    control,
    name: `sections.${sectionIndex}.questions`,
  });

  return (
    <div>
      {fields.map((field, questionIndex) => (
        <QuestionEditor
          key={field.id}
          sectionIndex={sectionIndex}
          questionIndex={questionIndex}
          onRemove={() => remove(questionIndex)}
        />
      ))}
      <button
        type="button"
        onClick={() => append({ id: uuidv4(), title: "", type: "short-text" })}
      >
        + Add Question
      </button>
    </div>
  );
}
