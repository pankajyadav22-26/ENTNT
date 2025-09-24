import { useForm } from "react-hook-form";
import type { SubmitHandler } from "react-hook-form";
import type { Job } from "../lib/db";
import { useEffect } from "react";

type Inputs = {
  title: string;
  slug: string;
};

type JobModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: SubmitHandler<Inputs>;
  jobToEdit: Job | null;
};

export function JobModal({
  isOpen,
  onClose,
  onSubmit,
  jobToEdit,
}: JobModalProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<Inputs>();

  useEffect(() => {
    if (jobToEdit) {
      reset({ title: jobToEdit.title, slug: jobToEdit.slug });
    } else {
      reset({ title: "", slug: "" });
    }
  }, [jobToEdit, reset]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 animate-fadeIn">
      <div className="bg-white/10 dark:bg-gray-900/80 backdrop-blur-xl border border-white/20 dark:border-gray-700 rounded-2xl w-96 p-6 shadow-2xl transition-transform transform animate-scaleIn">
        <h2 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-gray-100">
          {jobToEdit ? "Edit Job" : "Create New Job"}
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="block text-gray-700 dark:text-gray-300 mb-1 text-sm font-medium">
              Title
            </label>
            <input
              {...register("title", { required: "Title is required" })}
              className={`w-full px-4 py-2.5 rounded-lg bg-white/20 dark:bg-gray-800/60 text-gray-900 dark:text-gray-100 border focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400 ${
                errors.title ? "border-red-500" : "border-gray-300/40"
              }`}
              placeholder="Enter job title"
            />
            {errors.title && (
              <p className="text-red-400 text-xs mt-1">
                {errors.title.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-gray-700 dark:text-gray-300 mb-1 text-sm font-medium">
              Slug
            </label>
            <input
              {...register("slug", { required: "Slug is required" })}
              className={`w-full px-4 py-2.5 rounded-lg bg-white/20 dark:bg-gray-800/60 text-gray-900 dark:text-gray-100 border focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400 ${
                errors.slug ? "border-red-500" : "border-gray-300/40"
              }`}
              placeholder="job-slug"
            />
            {errors.slug && (
              <p className="text-red-400 text-xs mt-1">{errors.slug.message}</p>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-gray-200/70 hover:bg-gray-300/80 dark:bg-gray-700/70 dark:hover:bg-gray-600/70 text-gray-900 dark:text-gray-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-blue-600/90 hover:bg-blue-700 text-white shadow-md transition"
            >
              {jobToEdit ? "Save Changes" : "Create Job"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
