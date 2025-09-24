import { useFormContext } from "react-hook-form";
import type { Section } from "../lib/db";

export function AssessmentPreview() {
  const { watch } = useFormContext();
  const sections: Section[] = watch("sections") || [];

  return (
    <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl shadow-lg">
      <h3 className="text-xl font-semibold text-gray-100 mb-4">Live Preview</h3>

      {sections.map((section) => (
        <div
          key={section.id}
          className="mb-8 p-4 rounded-xl bg-white/5 border border-white/10"
        >
          <h4 className="text-lg font-medium text-cyan-300 mb-4">
            {section.title || "Section Title"}
          </h4>

          <div className="space-y-4">
            {section.questions.map((question) => (
              <div key={question.id}>
                <label className="block text-sm text-gray-300 mb-2">
                  {question.title || "Question Title"}
                </label>

                {question.type === "short-text" && (
                  <input
                    type="text"
                    disabled
                    placeholder="Short answer"
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-gray-400 placeholder-gray-500 focus:outline-none"
                  />
                )}

                {question.type === "long-text" && (
                  <textarea
                    disabled
                    placeholder="Long answer"
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-gray-400 placeholder-gray-500 focus:outline-none"
                    rows={3}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
