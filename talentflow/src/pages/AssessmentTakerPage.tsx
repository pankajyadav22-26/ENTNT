import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm, FormProvider, useFormContext } from "react-hook-form";
import type { Assessment, Question } from "../lib/db";

const fetchAssessment = async (jobId: string): Promise<Assessment> => {
  const res = await fetch(`/assessments/${jobId}`);
  if (!res.ok) throw new Error("Failed to fetch assessment");
  return res.json();
};

const submitAssessment = async ({
  jobId,
  answers,
}: {
  jobId: string;
  answers: any;
}) => {
  const res = await fetch(`/assessments/${jobId}/submit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ answers }),
  });
  if (!res.ok) throw new Error("Failed to submit assessment");
  return res.json();
};

export function AssessmentTakerPage() {
  const { jobId } = useParams<{ jobId: string }>();
  const methods = useForm();
  const { handleSubmit } = methods;

  const { data: assessment, isLoading } = useQuery({
    queryKey: ["assessment", jobId],
    queryFn: () => fetchAssessment(jobId!),
  });

  const mutation = useMutation({
    mutationFn: submitAssessment,
    onSuccess: () => {
      alert("Application submitted successfully!");
    },
    onError: () => {
      alert("There was an error submitting your application.");
    },
  });

  const onSubmit = (data: any) => {
    mutation.mutate({ jobId: jobId!, answers: data });
  };

  if (isLoading) return <div>Loading Assessment...</div>;
  if (!assessment || assessment.sections.length === 0) {
    return <div>This job does not have an assessment.</div>;
  }

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <h1>Application for Job #{jobId}</h1>
        <p>
          <Link to={`/jobs/${jobId}`}>&larr; Back to Job Details</Link>
        </p>
        {assessment.sections.map((section) => (
          <div key={section.id} style={{ marginBottom: "2rem" }}>
            <h2>{section.title}</h2>
            {section.questions.map((question) => (
              <DynamicQuestion key={question.id} question={question} />
            ))}
          </div>
        ))}
        <button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? "Submitting..." : "Submit Application"}
        </button>
      </form>
    </FormProvider>
  );
}

function DynamicQuestion({ question }: { question: Question }) {
  const { register, watch } = useFormContext();
  const fieldName = question.id;

  return (
    <div
      style={{
        marginBottom: "1rem",
        padding: "1rem",
        border: "1px solid #eee",
        borderRadius: "4px",
      }}
    >
      <label
        style={{ display: "block", fontWeight: "bold", marginBottom: "0.5rem" }}
      >
        {question.title}
      </label>

      {question.type === "short-text" && (
        <input
          type="text"
          {...register(fieldName, { required: true, maxLength: 100 })}
          style={{ width: "100%", boxSizing: "border-box" }}
        />
      )}

      {question.type === "long-text" && (
        <textarea
          {...register(fieldName, { required: true })}
          style={{ width: "100%", minHeight: "80px", boxSizing: "border-box" }}
        />
      )}
    </div>
  );
}
