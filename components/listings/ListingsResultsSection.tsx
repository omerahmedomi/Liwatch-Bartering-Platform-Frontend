import { Search, X } from "lucide-react";

import type { Post } from "@/app/types/post";
import { CardSkeleton } from "@/components/loaders/CardSkeleton";
import PostCard from "@/components/post/PostCard";

type Props = {
  filteredPosts: Post[];
  loading: boolean;
  onClearFilters: () => void;
};

export default function ListingsResultsSection({
  filteredPosts,
  loading,
  onClearFilters,
}: Props) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-8">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((skeletonIndex) => (
          <CardSkeleton key={skeletonIndex} />
        ))}
      </div>
    );
  }

  if (filteredPosts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-3 animate-in fade-in zoom-in-95 duration-500">
        <div className="size-20 rounded-4xl bg-slate-100 flex items-center justify-center text-slate-400 mb-6">
          <Search size={32} />
        </div>
        <h3 className="text-2xl font-black text-slate-900 mb-2">
          No matches found
        </h3>
        <p className="text-slate-500 font-medium mb-8 text-center max-w-md">
          We couldn&apos;t find any listings matching your current filters. Try
          adjusting your search criteria.
        </p>
        <button
          onClick={onClearFilters}
          className="flex items-center gap-2 bg-indigo-50 text-indigo-600 px-6 py-3 rounded-xl font-bold uppercase tracking-widest hover:bg-indigo-100 transition-all"
        >
          <X size={18} strokeWidth={3} />
          Clear All Filters
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="mb-6 flex justify-between items-end">
        <p className="text-slate-500 font-bold text-sm uppercase tracking-widest">
          Showing <span className="text-slate-900">{filteredPosts.length}</span>{" "}
          results
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        {filteredPosts.map((post) => (
          <PostCard key={ post.id} post={post} />
        ))}
      </div>
    </>
  );
}
