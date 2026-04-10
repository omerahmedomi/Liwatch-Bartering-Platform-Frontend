import { Plus, X } from "lucide-react";

import { CreatePostType } from "./createPostForm.types";

type Props = {
  postType: CreatePostType;
  previews: string[];
  onImageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveImage: (index: number) => void;
};

export default function CreatePostVisualsSection({
  postType,
  previews,
  onImageChange,
  onRemoveImage,
}: Props) {
  return (
    <section className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
      <header className="mb-6">
        <h2 className="text-xl font-black text-slate-900 tracking-tight">
          1. Show it off
        </h2>
        <p className="text-sm text-slate-500 font-medium">
          {postType === "ITEM"
            ? "Add up to 5 clear photos of the item from different angles."
            : "Add up to 5 images of your portfolio, workspace, or certifications."}
        </p>
      </header>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {previews.map((src, index) => (
          <div
            key={src}
            className="relative aspect-square rounded-3xl overflow-hidden border border-slate-100 group animate-in fade-in zoom-in-95"
          >
            <img src={src} className="object-cover w-full h-full" alt="Preview" />
            <button
              type="button"
              onClick={() => onRemoveImage(index)}
              className="absolute top-2 right-2 size-8 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center text-red-500 shadow-sm border border-red-50 hover:bg-red-300 hover:text-white transition-all cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>
        ))}

        {previews.length < 5 && (
          <label className="aspect-square rounded-3xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 hover:border-indigo-400 hover:bg-indigo-50/30 transition-all cursor-pointer group">
            <div className="size-12 rounded-2xl bg-slate-50 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Plus
                size={24}
                className="text-slate-400 group-hover:text-indigo-600"
              />
            </div>
            <input
              type="file"
              multiple
              className="hidden"
              onChange={onImageChange}
              accept="image/*"
            />
          </label>
        )}
      </div>
    </section>
  );
}
