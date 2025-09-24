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

  const methods = useForm<Assessment>({
    defaultValues: { jobId: jobId, sections: [] },
  });
  const { control, handleSubmit, reset, watch } = methods;

  const {
    fields: sections,
    append: appendSection,
    remove: removeSection,
  } = useFieldArray({
    control,
    name: "sections",
  });

  const watchedSections = watch("sections");

  useEffect(() => {
    if (assessmentData) {
      reset(assessmentData);
    }
  }, [assessmentData, reset]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen text-gray-400">
        Loading Assessment Builder...
      </div>
    );
  }

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={handleSubmit((data) => mutation.mutate(data))}
        className="p-6"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-white">
            Assessment Builder for Job ID:{" "}
            <span className="text-cyan-400">{jobId}</span>
          </h2>
          <button
            type="submit"
            disabled={mutation.isPending}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-medium shadow-md hover:shadow-lg hover:from-cyan-400 hover:to-purple-500 transition disabled:opacity-50"
          >
            {mutation.isPending ? "Saving..." : "💾 Save Assessment"}
          </button>
        </div>

        <Link
          to={`/jobs/${jobId}`}
          className="text-sm text-cyan-400 hover:underline"
        >
          ← Back to Job Details
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div className="space-y-6">
            {sections.map((section, sectionIndex) => (
              <div
                key={section.id}
                className="p-5 rounded-2xl backdrop-blur-md bg-white/5 border border-white/10 shadow-lg space-y-4"
              >
                <input
                  {...control.register(`sections.${sectionIndex}.title`)}
                  placeholder="Section Title"
                  className="w-full bg-transparent border-b border-gray-500 text-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 transition"
                />
                <QuestionsForSection
                  sectionIndex={sectionIndex}
                  allSections={watchedSections}
                />
                <button
                  type="button"
                  onClick={() => removeSection(sectionIndex)}
                  className="text-sm text-red-400 hover:text-red-300"
                >
                  ✖ Remove Section
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() =>
                appendSection({ id: uuidv4(), title: "", questions: [] })
              }
              className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-cyan-400 hover:bg-white/10 transition"
            >
              ＋ Add Section
            </button>
          </div>

          <div className="p-5 rounded-2xl backdrop-blur-md bg-white/5 border border-white/10 shadow-lg">
            <AssessmentPreview />
          </div>
        </div>
      </form>
    </FormProvider>
  );
}

function QuestionsForSection({
  sectionIndex,
  allSections,
}: {
  sectionIndex: number;
  allSections: Section[];
}) {
  const { control } = useFormContext();
  const { fields, append, remove } = useFieldArray({
    control,
    name: `sections.${sectionIndex}.questions`,
  });

  return (
    <div className="space-y-4">
      {fields.map((field, questionIndex) => {
        const allQuestions = allSections.flatMap((s) => s.questions);
        const currentQuestionId = (field as Question).id;
        const currentQuestionGlobalIndex = allQuestions.findIndex(
          (q) => q.id === currentQuestionId
        );
        const availableQuestions = allQuestions.slice(
          0,
          currentQuestionGlobalIndex
        );

        return (
          <QuestionEditor
            key={field.id}
            sectionIndex={sectionIndex}
            questionIndex={questionIndex}
            onRemove={() => remove(questionIndex)}
            availableQuestions={availableQuestions}
          />
        );
      })}
      <button
        type="button"
        onClick={() =>
          append({
            id: uuidv4(),
            title: "",
            type: "short-text",
            validation: { required: false },
          })
        }
        className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-cyan-400 hover:bg-white/10 transition"
      >
        ＋ Add Question
      </button>
    </div>
  );
}
