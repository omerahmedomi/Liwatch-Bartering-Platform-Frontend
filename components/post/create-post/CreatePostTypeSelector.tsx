import { Package, Zap } from "lucide-react";

import { CreatePostType } from "./createPostForm.types";

type Props = {
  selectedType: CreatePostType;
  onSelect: (type: CreatePostType) => void;
};

export default function CreatePostTypeSelector({
  selectedType,
  onSelect,
}: Props) {
  return (
    <div className="max-w-xs mx-auto mb-10 p-1.5 bg-slate-100 dark:bg-slate-800 rounded-4xl flex items-center shadow-inner">
      {(["ITEM", "SERVICE"] as const).map((type) => (
        <button
          key={type}
          type="button"
          onClick={() => onSelect(type)}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-[1.8rem] text-sm font-black transition-all duration-300 ${
            selectedType === type
              ? "bg-white dark:bg-slate-900 text-indigo-600 shadow-md scale-[1.02]"
              : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
          }`}
        >
          {type === "ITEM" ? <Package size={18} /> : <Zap size={18} />}
          {type}
        </button>
      ))}
    </div>
  );
}
