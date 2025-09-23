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
  submissionData,
}: {
  jobId: string;
  submissionData: any;
}) => {
  const res = await fetch(`/assessments/${jobId}/submit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(submissionData),
  });
  if (!res.ok) throw new Error("Failed to submit assessment");
  return res.json();
};

export function AssessmentTakerPage() {
  const { jobId } = useParams<{ jobId: string }>();
  const methods = useForm({
    defaultValues: {
      name: "",
      email: "",
      answers: {},
    },
  });
  const {
    handleSubmit,
    register,
    formState: { errors },
  } = methods;

  const { data: assessment, isLoading } = useQuery({
    queryKey: ["assessment", jobId],
    queryFn: () => fetchAssessment(jobId!),
    enabled: !!jobId,
  });

  const mutation = useMutation({
    mutationFn: submitAssessment,
    onSuccess: () => {
      alert(
        "Application submitted successfully! You will now appear in the HR candidate list."
      );
      methods.reset();
    },
    onError: () => {
      alert("There was an error submitting your application.");
    },
  });

  const onSubmit = (data: any) => {
    const submissionData = {
      name: data.name,
      email: data.email,
      answers: data.answers || {},
    };
    mutation.mutate({ jobId: jobId!, submissionData });
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

        <div
          style={{
            marginBottom: "2rem",
            border: "1px solid #ccc",
            padding: "1rem",
            borderRadius: "4px",
          }}
        >
          <h2>Your Information</h2>
          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", fontWeight: "bold" }}>
              Full Name *
            </label>
            <input
              type="text"
              {...register("name", { required: "Name is required" })}
              style={{ width: "100%", boxSizing: "border-box" }}
            />
            {errors.name && (
              <p style={{ color: "red", fontSize: "0.8rem" }}>
                {errors.name.message as string}
              </p>
            )}
          </div>
          <div>
            <label style={{ display: "block", fontWeight: "bold" }}>
              Email *
            </label>
            <input
              type="email"
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^\S+@\S+$/i,
                  message: "Invalid email address",
                },
              })}
              style={{ width: "100%", boxSizing: "border-box" }}
            />
            {errors.email && (
              <p style={{ color: "red", fontSize: "0.8rem" }}>
                {errors.email.message as string}
              </p>
            )}
          </div>
        </div>

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
  const {
    register,
    watch,
    formState: { errors },
  } = useFormContext();

  const fieldName = `answers.${question.id}`;
  const validationRules = question.validation || {};

  const dependentQuestionId = question.conditional?.questionId;
  const dependentValue = dependentQuestionId
    ? watch(`answers.${dependentQuestionId}`)
    : null;

  if (
    dependentQuestionId &&
    dependentValue?.toString() !== question.conditional?.value?.toString()
  ) {
    return null;
  }

  const errorMessage = (errors.answers as any)?.[question.id]
    ?.message as string;

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
        {question.title} {validationRules.required && "*"}
      </label>

      {question.type === "short-text" && (
        <input
          type="text"
          {...register(fieldName, validationRules)}
          style={{ width: "100%" }}
        />
      )}
      {question.type === "long-text" && (
        <textarea
          {...register(fieldName, validationRules)}
          style={{ width: "100%", minHeight: "80px" }}
        />
      )}
      {question.type === "numeric" && (
        <input
          type="number"
          {...register(fieldName, { ...validationRules, valueAsNumber: true })}
          style={{ width: "100%" }}
        />
      )}
      {question.type === "file-upload" && (
        <input type="file" {...register(fieldName, validationRules)} />
      )}

      {errorMessage && (
        <p style={{ color: "red", fontSize: "0.8rem" }}>{errorMessage}</p>
      )}
    </div>
  );
}