"use client";

import { Suspense, useEffect, useMemo, useState } from "react";

import { Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

import type { Post } from "@/app/types/post";
import ListingsFiltersPanel from "@/components/listings/ListingsFiltersPanel";
import ListingsResultsSection from "@/components/listings/ListingsResultsSection";
import api from "@/lib/axios";
import { ITEM_CATEGORIES, SERVICE_CATEGORIES } from "@/lib/categories";

function ListingsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [typeFilter, setTypeFilter] = useState(searchParams.get("type") || "ALL");
  const [categoryFilter, setCategoryFilter] = useState(
    searchParams.get("category") || "ALL",
  );
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  const categories = useMemo(
    () => ["ALL", ...ITEM_CATEGORIES, ...SERVICE_CATEGORIES],
    [],
  );

  useEffect(() => {
    const fetchListings = async () => {
      setLoading(true);
      try {
        const response = await api.get("/api/post/allPosts?page=0&size=50");
        setPosts(response.data.content || []);
      } catch (error) {
        console.error("Failed to fetch listings:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();
    if (searchQuery) {
      params.set("q", searchQuery);
    }
    if (typeFilter !== "ALL") {
      params.set("type", typeFilter);
    }
    if (categoryFilter !== "ALL") {
      params.set("category", categoryFilter);
    }

    const nextQuery = params.toString();
    router.replace(nextQuery ? `/listings?${nextQuery}` : "/listings", {
      scroll: false,
    });
  }, [searchQuery, typeFilter, categoryFilter, router]);

  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const normalizedSearchQuery = searchQuery.toLowerCase();
      const matchesSearch =
        (post.title ?? "").toLowerCase().includes(normalizedSearchQuery) ||
        (post.description ?? "").toLowerCase().includes(normalizedSearchQuery);
      const matchesType = typeFilter === "ALL" || post.postType === typeFilter;
      const matchesCategory =
        categoryFilter === "ALL" || post.category === categoryFilter;

      return matchesSearch && matchesType && matchesCategory;
    });
  }, [posts, searchQuery, typeFilter, categoryFilter]);

  const clearFilters = () => {
    setSearchQuery("");
    setTypeFilter("ALL");
    setCategoryFilter("ALL");
  };

  return (
    <div className="max-w-7xl mx-auto ">
      <div className="sticky -top-18 md:-top-3 z-30">
        <ListingsFiltersPanel
          categories={categories}
          categoryFilter={categoryFilter}
          searchQuery={searchQuery}
          typeFilter={typeFilter}
          onCategoryFilterChange={setCategoryFilter}
          onSearchQueryChange={setSearchQuery}
          onTypeFilterChange={setTypeFilter}
        />
      </div>
      <div className="px-6">
        <ListingsResultsSection
          filteredPosts={filteredPosts}
          loading={loading}
          onClearFilters={clearFilters}
        />
      </div>
    </div>
  );
}

export default function ListingsPage() {
  return (
    <main className="pt-20 pb-20 min-h-screen bg-slate-50 dark:bg-slate-950">
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
