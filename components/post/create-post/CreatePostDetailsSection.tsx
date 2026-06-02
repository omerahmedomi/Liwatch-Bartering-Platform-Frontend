import type { Dispatch, SetStateAction } from "react";

import { ChevronDown } from "lucide-react";

import { LocationAutocomplete } from "@/components/LocationAutocomplete";

import ItemTradeDetailsFields from "./ItemTradeDetailsFields";
import ServiceOfferDetailsFields from "./ServiceOfferDetailsFields";
import { CreatePostFormState } from "./createPostForm.types";

type Props = {
  formData: CreatePostFormState;
  setFormData: Dispatch<SetStateAction<CreatePostFormState>>;
  availableCategories: readonly string[];
};

export default function CreatePostDetailsSection({
  formData,
  setFormData,
  availableCategories,
}: Props) {
  return (
    <section className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
      <h2 className="text-xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
        2. The Details
      </h2>

      <div>
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">
          Category
        </label>
        <div className="relative">
          <select
            value={formData.category}
            onChange={(event) =>
              setFormData((current) => ({
                ...current,
                category: event.target.value,
              }))
            }
            className="w-full pl-4 pr-10 py-3.5 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800 focus:border-indigo-200 dark:focus:border-indigo-800 outline-none font-bold text-sm appearance-none cursor-pointer text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
          >
            {availableCategories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          <ChevronDown
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            size={18}
          />
        </div>
      </div>

      <div className="space-y-4">
        <input
          value={formData.title}
          placeholder="Title of your item or service"
          className="w-full text-[22px] sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 outline-none placeholder:text-slate-400 focus:placeholder:text-slate-300 dark:placeholder:text-slate-600 dark:focus:placeholder:text-slate-500 bg-transparent"
          onChange={(event) =>
            setFormData((current) => ({
              ...current,
              title: event.target.value,
            }))
          }
        />
        <textarea
          value={formData.description}
          placeholder="Describe the condition, history, or features..."
          className="w-full h-32 text-slate-600 dark:text-slate-400 font-medium outline-none resize-none border-none focus:ring-0 placeholder:text-slate-400 dark:placeholder:text-slate-600 bg-transparent"
          onChange={(event) =>
            setFormData((current) => ({
              ...current,
              description: event.target.value,
            }))
          }
        />
      </div>

      <div className="pt-8 mt-6 border-t border-slate-100 dark:border-slate-800/50 animate-in fade-in duration-300">
        {formData.postType === "ITEM" ? (
          <ItemTradeDetailsFields
            formData={formData}
            setFormData={setFormData}
          />
        ) : (
          <ServiceOfferDetailsFields
            formData={formData}
            setFormData={setFormData}
          />
        )}
      </div>

      <div className="pt-6 border-t border-slate-100 dark:border-slate-800/50">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">
          {formData.postType === "SERVICE" ? "Service Area" : "Item Location"}
        </label>

        <LocationAutocomplete
          value={formData.location}
          onChange={(value) =>
            setFormData((current) => ({ ...current, location: value }))
          }
          placeholder={
            formData.postType === "SERVICE"
              ? "Which city/neighborhood do you serve?"
              : "City for pickup/exchange"
          }
        />

        <p className="text-[10px] text-slate-400 mt-2 italic">
          * Start typing a city like &quot;Addis Ababa&quot; or enter a
          specific neighborhood.
        </p>
      </div>
    </section>
  );
}
