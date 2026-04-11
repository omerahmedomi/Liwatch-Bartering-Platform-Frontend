"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft, Loader2, MapPin, CalendarDays } from "lucide-react";
import api from "@/lib/axios";
import PostImageGallery from "@/components/post/PostImageGallery";
import PostSidebar from "@/components/post/PostSidebar";

export default function PostDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const postId = params.id;

  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!postId) return;

    const fetchPost = async () => {
      try {
        const res = await api.get(`/api/post/${postId}`);
        setPost(res.data);
      } catch (err) {
        console.error("Failed to fetch post details:", err);
        // Optional: Route to 404 if post doesn't exist
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [postId]);

  if (loading) {
    return (
      <div className="flex flex-col h-screen items-center justify-center bg-slate-50 gap-4">
        <Loader2 className="animate-spin text-indigo-600" size={48} />
        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">
          Loading Details...
        </p>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <p className="text-slate-500 font-bold">Post not found.</p>
      </div>
    );
  }

  // Formatting the date nicely
  const postedDate = new Date(post.createdAt).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <main className="min-h-screen bg-slate-50 pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-6">
        {/* --- Back Navigation --- */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-900 font-bold uppercase text-xs tracking-widest mb-8 transition-colors w-fit"
        >
          <ChevronLeft size={16} /> Back to Market
        </button>

        {/* --- Image Gallery Component --- */}
        <PostImageGallery images={post.postImages} title={post.title} />

        {/* --- 2-Column Layout --- */}
        <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* LEFT COLUMN: Main Information */}
          <div className="lg:col-span-2 space-y-8">
            {/* Header Info */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <span className="bg-indigo-100 text-indigo-600 px-3 py-1 rounded-md text-xs font-black uppercase tracking-widest">
                  {post.category}
                </span>
                <span className="text-slate-400 flex items-center gap-1.5 text-xs font-bold">
                  <CalendarDays size={14} /> {postedDate}
                </span>
              </div>

              <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight mb-6">
                {post.title}
              </h1>

              <div className="flex items-center gap-2 text-slate-500 font-medium">
                <MapPin size={18} className="text-indigo-500" />
                Addis Ababa, Ethiopia (Remote Trading Available)
              </div>
            </div>

            <hr className="border-slate-200" />

            {/* Description */}
            <div>
              <h2 className="text-xl font-black text-slate-900 mb-4">
                Description
              </h2>
              <p className="text-slate-600 leading-relaxed whitespace-pre-line">
                {post.description}
              </p>
            </div>

            {/* If it's a service, show duration/availability */}
            {post.postType === "SERVICE" && post.service && (
              <>
                <hr className="border-slate-200" />
                <div>
                  <h2 className="text-xl font-black text-slate-900 mb-4">
                    Service Details
                  </h2>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded-2xl border border-slate-100">
                      <p className="text-slate-400 text-xs font-bold uppercase mb-1">
                        Duration
                      </p>
                      <p className="text-slate-900 font-bold">
                        {post.service.serviceDuration}
                      </p>
                    </div>
                    <div className="bg-white p-4 rounded-2xl border border-slate-100">
                      <p className="text-slate-400 text-xs font-bold uppercase mb-1">
                        Availability
                      </p>
                      <p className="text-slate-900 font-bold">
                        {post.service.availability}
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* RIGHT COLUMN: Action Sidebar Component */}
          <div className="lg:col-span-1">
            <PostSidebar post={post} />
          </div>
        </div>
      </div>
    </main>
  );
}
