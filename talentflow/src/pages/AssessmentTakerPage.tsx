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
      alert("✅ Application submitted successfully!");
      methods.reset();
    },
    onError: () => {
      alert("❌ There was an error submitting your application.");
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

  if (isLoading)
    return (
      <div className="text-center text-gray-400">Loading Assessment...</div>
    );
  if (!assessment || assessment.sections.length === 0) {
    return (
      <div className="text-center text-gray-500">
        This job does not have an assessment.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white px-6 py-12">
      <div className="max-w-3xl mx-auto backdrop-blur-lg bg-white/10 border border-white/20 shadow-2xl rounded-2xl p-8">
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-semibold">
                Application for Job{" "}
                <span className="text-indigo-400">#{jobId}</span>
              </h1>
              <Link
                to={`/jobs/${jobId}`}
                className="text-sm text-gray-400 hover:text-indigo-300 transition"
              >
                &larr; Back to Job Details
              </Link>
            </div>

            {/* User Info */}
            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-6 shadow-md space-y-4">
              <h2 className="text-xl font-semibold text-indigo-300">
                Your Information
              </h2>
              <div>
                <label className="block mb-1 text-sm font-medium">
                  Full Name *
                </label>
                <input
                  type="text"
                  {...register("name", { required: "Name is required" })}
                  className="w-full rounded-lg bg-white/10 border border-white/20 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
                {errors.name && (
                  <p className="text-red-400 text-sm mt-1">
                    {errors.name.message as string}
                  </p>
                )}
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium">
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
                  className="w-full rounded-lg bg-white/10 border border-white/20 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
                {errors.email && (
                  <p className="text-red-400 text-sm mt-1">
                    {errors.email.message as string}
                  </p>
                )}
              </div>
            </div>

            {/* Sections */}
            {assessment.sections.map((section) => (
              <div
                key={section.id}
                className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-6 shadow-md space-y-4"
              >
                <h2 className="text-xl font-semibold text-indigo-300">
                  {section.title}
                </h2>
                {section.questions.map((question) => (
                  <DynamicQuestion key={question.id} question={question} />
                ))}
              </div>
            ))}

            <button
              type="submit"
              disabled={mutation.isPending}
              className="w-full bg-indigo-500 hover:bg-indigo-600 disabled:bg-gray-600 transition text-white font-semibold rounded-lg py-3 shadow-lg"
            >
              {mutation.isPending ? "Submitting..." : "Submit Application"}
            </button>
          </form>
        </FormProvider>
      </div>
    </div>
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
    <div className="space-y-2">
      <label className="block text-sm font-medium">
        {question.title}{" "}
        {validationRules.required && <span className="text-red-400">*</span>}
      </label>

      {question.type === "short-text" && (
        <input
          type="text"
          {...register(fieldName, validationRules)}
          className="w-full rounded-lg bg-white/10 border border-white/20 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
      )}
      {question.type === "long-text" && (
        <textarea
          {...register(fieldName, validationRules)}
          className="w-full rounded-lg bg-white/10 border border-white/20 px-3 py-2 min-h-[100px] focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
      )}
      {question.type === "numeric" && (
        <input
          type="number"
          {...register(fieldName, { ...validationRules, valueAsNumber: true })}
          className="w-full rounded-lg bg-white/10 border border-white/20 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
      )}
      {question.type === "file-upload" && (
        <input
          type="file"
          {...register(fieldName, validationRules)}
          className="text-gray-300 file:mr-4 file:rounded-lg file:border-0 file:bg-indigo-500 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-indigo-600"
        />
      )}

      {errorMessage && <p className="text-red-400 text-sm">{errorMessage}</p>}
    </div>
  );
}