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
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0,0,0,0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          background: "white",
          padding: "2rem",
          borderRadius: "5px",
          width: "400px",
        }}
      >
        <h2>{jobToEdit ? "Edit Job" : "Create New Job"}</h2>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div style={{ marginBottom: "1rem" }}>
            <label>Title</label>
            <input
              {...register("title", { required: "Title is required" })}
              style={{ width: "100%", padding: "0.5rem" }}
            />
            {errors.title && (
              <p style={{ color: "red" }}>{errors.title.message}</p>
            )}
          </div>
          <div style={{ marginBottom: "1rem" }}>
            <label>Slug</label>
            <input
              {...register("slug", { required: "Slug is required" })}
              style={{ width: "100%", padding: "0.5rem" }}
            />
            {errors.slug && (
              <p style={{ color: "red" }}>{errors.slug.message}</p>
            )}
          </div>
          <div
            style={{ display: "flex", justifyContent: "flex-end", gap: "1rem" }}
          >
            <button type="button" onClick={onClose}>
              Cancel
            </button>
            <button type="submit">
              {jobToEdit ? "Save Changes" : "Create Job"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}