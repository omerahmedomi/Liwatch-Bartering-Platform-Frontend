"use client";
import { useState, useEffect, Suspense, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Search,
  SlidersHorizontal,
  Package,
  Zap,
  Clock,
  X,
  Loader2,
} from "lucide-react";
import api from "@/lib/axios";
import PostCard from "@/components/post/PostCard";
import { ITEM_CATEGORIES, SERVICE_CATEGORIES } from "@/lib/categories";
import { CardSkeleton } from "@/components/loaders/CardSkeleton";
import Navbar from "@/components/Navbar";
import { isTokenValid } from "@/lib/auth";

// ==========================================
// 2. THE MAIN CONTENT (Wrapped in Suspense)
// ==========================================
function ListingsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // URL-driven initial state
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [typeFilter, setTypeFilter] = useState(
    searchParams.get("type") || "ALL",
  );
  const [exchangeFilter, setExchangeFilter] = useState(
    searchParams.get("exchange") || "ALL",
  );
  const [categoryFilter, setCategoryFilter] = useState(
    searchParams.get("category") || "ALL",
  );

  // Data state
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Constants
  const CATEGORIES = ["ALL", ...ITEM_CATEGORIES, ...SERVICE_CATEGORIES];

  // Fetch Data (Grabbing page 0 for now. Will upgrade to infinite scroll later)
  useEffect(() => {
    const fetchListings = async () => {
      setLoading(true);
      try {
        const res = await api.get("/api/post/allPosts?page=0&size=50");
        setPosts(res.data.content || []);
      } catch (err) {
        console.error("Failed to fetch listings:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchListings();
  }, []);

  // Sync state changes to URL seamlessly
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchQuery) params.set("q", searchQuery);
    if (typeFilter !== "ALL") params.set("type", typeFilter);
    if (exchangeFilter !== "ALL") params.set("exchange", exchangeFilter);
    if (categoryFilter !== "ALL") params.set("category", categoryFilter);

    router.replace(`/listings?${params.toString()}`, { scroll: false });
  }, [searchQuery, typeFilter, exchangeFilter, categoryFilter, router]);

  // Client-Side Compound Filtering
  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      // 1. Search Query
      const matchesSearch =
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.description.toLowerCase().includes(searchQuery.toLowerCase());
      // 2. Post Type (Item vs Service)
      const matchesType = typeFilter === "ALL" || post.postType === typeFilter;
      // 3. Exchange Type (Permanent vs Temporary)
      const matchesExchange =
        exchangeFilter === "ALL" || post.exchangeType === exchangeFilter;
      // 4. Category
      const matchesCategory =
        categoryFilter === "ALL" || post.category === categoryFilter;

      return matchesSearch && matchesType && matchesExchange && matchesCategory;
    });
  }, [posts, searchQuery, typeFilter, exchangeFilter, categoryFilter]);

  const clearFilters = () => {
    setSearchQuery("");
    setTypeFilter("ALL");
    setExchangeFilter("ALL");
    setCategoryFilter("ALL");
  };

  return (
    <>
    {/* <Navbar isLoggedIn={isTokenValid()}/> */}
      <div className="max-w-7xl mx-auto px-6">
        {/* <Navbar/> */}
        {/* --- Search & Main Filters Bar --- */}
        <div className="bg-white rounded-3xl p-4 md:p-6 shadow-sm border border-slate-100 mb-8 sticky top-20 z-30">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search Input */}
            <div className="relative flex-grow">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Search items, services, or skills..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 pl-12 pr-4 py-4 rounded-2xl border-none text-slate-900 placeholder:text-slate-400 font-medium focus:ring-2 focus:ring-indigo-600 outline-none transition-all"
              />
            </div>

            {/* Quick Filters */}
            <div className="flex overflow-x-auto hide-scrollbar gap-2 shrink-0 items-center">
              {/* Type Toggle */}
              <div className="flex bg-slate-50 p-1 rounded-2xl shrink-0">
                <button
                  onClick={() => setTypeFilter("ALL")}
                  className={`px-4 py-3 rounded-xl text-sm font-bold uppercase tracking-wider transition-all ${typeFilter === "ALL" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900"}`}
                >
                  All
                </button>
                <button
                  onClick={() => setTypeFilter("ITEM")}
                  className={`flex items-center gap-1.5 px-4 py-3 rounded-xl text-sm font-bold uppercase tracking-wider transition-all ${typeFilter === "ITEM" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-900"}`}
                >
                  <Package size={16} /> Items
                </button>
                <button
                  onClick={() => setTypeFilter("SERVICE")}
                  className={`flex items-center gap-1.5 px-4 py-3 rounded-xl text-sm font-bold uppercase tracking-wider transition-all ${typeFilter === "SERVICE" ? "bg-white text-emerald-600 shadow-sm" : "text-slate-500 hover:text-slate-900"}`}
                >
                  <Zap size={16} /> Services
                </button>
              </div>

              {/* Exchange Toggle */}
              <button
                onClick={() =>
                  setExchangeFilter(
                    exchangeFilter === "TEMPORARY" ? "ALL" : "TEMPORARY",
                  )
                }
                className={`flex items-center gap-2 px-5 py-3.5 rounded-2xl text-sm font-bold uppercase tracking-wider transition-all border shrink-0 ${exchangeFilter === "TEMPORARY" ? "bg-amber-50 border-amber-200 text-amber-600" : "bg-white border-slate-200 text-slate-500 hover:border-slate-300"}`}
              >
                <Clock size={16} /> Temp Only
              </button>
            </div>
          </div>

          {/* Categories Scroller */}
          <div className="flex overflow-x-auto hide-scrollbar gap-2 mt-4 pt-4 border-t border-slate-100 items-center">
            <SlidersHorizontal
              size={16}
              className="text-slate-400 shrink-0 ml-2 mr-1"
            />
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all shrink-0 ${
                  categoryFilter === cat
                    ? "bg-slate-900 text-white"
                    : "bg-slate-50 text-slate-500 hover:bg-slate-100"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* --- Results Section --- */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <CardSkeleton key={n} />
            ))}
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 animate-in fade-in zoom-in-95 duration-500">
            <div className="size-20 rounded-[2rem] bg-slate-100 flex items-center justify-center text-slate-400 mb-6">
              <Search size={32} />
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-2">
              No matches found
            </h3>
            <p className="text-slate-500 font-medium mb-8 text-center max-w-md">
              We couldn't find any listings matching your current filters. Try
              adjusting your search criteria.
            </p>
            <button
              onClick={clearFilters}
              className="flex items-center gap-2 bg-indigo-50 text-indigo-600 px-6 py-3 rounded-xl font-bold uppercase tracking-widest hover:bg-indigo-100 transition-all"
            >
              <X size={18} strokeWidth={3} />
              Clear All Filters
            </button>
          </div>
        ) : (
          <>
            <div className="mb-6 flex justify-between items-end">
              <p className="text-slate-500 font-bold text-sm uppercase tracking-widest">
                Showing{" "}
                <span className="text-slate-900">{filteredPosts.length}</span>{" "}
                results
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
              {filteredPosts.map((post: any) => (
                <PostCard key={post.postId || post.id} post={post} />
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
}

// ==========================================
// 3. THE PAGE EXPORT
// ==========================================
export default function ListingsPage() {
  return (
    <main className="pt-24 pb-20 min-h-screen bg-slate-50">
      {/* We MUST wrap useSearchParams in a Suspense boundary */}
      <Suspense
        fallback={
          <div className="flex h-screen items-center justify-center">
            <Loader2 className="animate-spin text-indigo-600" size={40} />
          </div>
        }
      >
        <ListingsContent />
      </Suspense>
    </main>
  );
}
