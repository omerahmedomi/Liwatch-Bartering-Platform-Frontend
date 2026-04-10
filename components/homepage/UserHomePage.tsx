"use client";
import Link from "next/link";
import { Plus, Package, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import api from "@/lib/axios";
import PostCard from "../post/PostCard";
import { Post } from "@/app/types/post";

export default function UserHomePage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  // Fix 1: Ensure component is mounted before rendering to avoid Hydration errors
  useEffect(() => {
    setMounted(true);
    const fetchPosts = async () => {
      try {
        const res = await api.get("/api/post/allPosts?page=0&size=12");
        // Spring Boot Page object returns data in 'content'
        setPosts(res.data.content || []);
      } catch (err) {
        console.error("Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  if (!mounted) return null;

  return (
    <main className="pt-24 pb-16 min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-6">
        {/* --- Header Section --- */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">
              Welcome back,{" "}
              <span className="text-indigo-600 italic">Trader.</span>
            </h1>
            <p className="text-slate-500 font-medium">
              What would you like to swap today?
            </p>
          </div>

          <Link
            href="/create-post"
            className="flex items-center justify-center gap-2 bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-500/20 active:scale-95"
          >
            <Plus size={20} strokeWidth={3} />
            Post an Item/ a Service
          </Link>
        </div>

        {/* --- Feed Section --- */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <Loader2 className="animate-spin text-indigo-600" size={40} />
            <p className="text-xs font-black text-slate-400 uppercase tracking-tighter">
              Loading Marketplace...
            </p>
          </div>
        ) : posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-slate-200 rounded-[3rem] bg-white/50 animate-in fade-in zoom-in-95 duration-500">
            <div className="size-16 rounded-3xl bg-indigo-50 flex items-center justify-center text-indigo-500 mb-4">
              <Package size={32} />
            </div>
            <p className="text-slate-900 font-bold text-lg">
              Your inventory is empty
            </p>
            <p className="text-slate-500 text-sm mb-6 text-center">
              List your first item to start bartering with the community.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {posts.map((post: Post) => (
              <PostCard key={post.postId || post.id} post={post} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
