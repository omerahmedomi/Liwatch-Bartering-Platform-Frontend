import type { Dispatch, SetStateAction } from "react";

import { CreatePostFormState } from "./createPostForm.types";

type Props = {
  formData: CreatePostFormState;
  setFormData: Dispatch<SetStateAction<CreatePostFormState>>;
};

export default function ServiceOfferDetailsFields({
  formData,
  setFormData,
}: Props) {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="text-[10px] font-black text-emerald-600 uppercase tracking-widest block mb-3">
            Your Skill Level
          </label>
          <div className="flex p-1.5 bg-emerald-50 rounded-2xl">
            {(["BEGINNER", "EXPERT"] as const).map((level) => (
              <button
                key={level}
                type="button"
                onClick={() =>
                  setFormData((current) => ({
                    ...current,
                    service: { ...current.service, skillLevel: level },
                  }))
                }
                className={`flex-1 py-3 text-xs font-black rounded-xl transition-all ${
                  formData.service.skillLevel === level
                    ? "bg-white text-emerald-600 shadow-sm"
                    : "text-emerald-700/50"
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">
            Availability
          </label>
          <input
            value={formData.service.availability}
            placeholder="e.g. Weekends, Evenings, Anytime..."
            className="w-full px-4 py-3.5 bg-slate-50 rounded-2xl border border-slate-100 focus:border-emerald-200 outline-none font-bold text-sm"
            onChange={(event) =>
              setFormData((current) => ({
                ...current,
                service: {
                  ...current.service,
                  availability: event.target.value,
                },
              }))
            }
          />
        </div>
      </div>

      <div>
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">
          Service Duration
        </label>
        <input
          value={formData.service.serviceDuration}
          placeholder="e.g. 1 Hour, 1 Month, Project-based..."
          className="w-full px-4 py-3.5 bg-slate-50 rounded-2xl border border-slate-100 focus:border-emerald-200 outline-none font-bold text-sm"
          onChange={(event) =>
            setFormData((current) => ({
              ...current,
              service: {
                ...current.service,
                serviceDuration: event.target.value,
              },
            }))
          }
        />
      </div>
    </div>
  );
}
