"use client";

import { useEffect, useState } from "react";
import { Heart, Loader2, ChevronLeft, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/axios";
import PostCard from "@/components/post/PostCard";
import type { Post } from "@/app/types/post";

export default function WishlistPage() {
  const router = useRouter();
  const [wishlist, setWishlist] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        const res = await api.get("/api/wishlist/my-wishlist");
        // Convert PostResponseDto items to type Post
        const mappedData = res.data.map((item: any) => ({
          ...item,
          id: item.postId, // Ensure both id and postId are set to be safe with PostCard
        }));
        setWishlist(mappedData);
      } catch (err) {
        console.error("Failed to fetch wishlist:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchWishlist();
  }, []);

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-6">
        {/* Navigation */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 font-bold uppercase text-xs tracking-widest mb-8 transition-colors w-fit cursor-pointer"
        >
          <ChevronLeft size={16} /> Back
        </button>

        {/* Title */}
        <div className="mb-10">
          <h1 className="text-4xl font-black text-slate-900 dark:text-slate-100 tracking-tighter uppercase flex items-center gap-3">
            My <span className="text-indigo-600">Wishlist</span>
            <Heart className="text-rose-500 fill-rose-500 animate-pulse" size={32} />
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-semibold mt-2">
            View and manage all the items and services you have saved.
          </p>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="animate-spin text-indigo-600" size={48} />
            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">
              Loading wishlist...
            </p>
          </div>
        ) : wishlist.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-8 max-w-md mx-auto text-center animate-in fade-in zoom-in-95 duration-500 shadow-[0_10px_30px_rgba(0,0,0,0.02)]">
            <div className="size-20 rounded-4xl bg-rose-50 dark:bg-rose-950/20 flex items-center justify-center text-rose-500 dark:text-rose-400 mb-6">
              <Heart size={36} className="fill-rose-500/10" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-slate-100 mb-2">
              Your wishlist is empty
            </h3>
            <p className="text-slate-500 dark:text-slate-400 font-medium mb-8">
              Explore listings and save items or services you are interested in for future reference.
            </p>
            <Link
              href="/listings"
              className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-bold uppercase tracking-widest transition-all shadow-lg shadow-indigo-500/20 active:scale-95 cursor-pointer w-full text-xs"
            >
              Explore Listings
              <ArrowRight size={16} />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {wishlist.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
