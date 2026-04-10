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
  const [exchangeFilter, setExchangeFilter] = useState(
    searchParams.get("exchange") || "ALL",
  );
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
    if (exchangeFilter !== "ALL") {
      params.set("exchange", exchangeFilter);
    }
    if (categoryFilter !== "ALL") {
      params.set("category", categoryFilter);
    }

    const nextQuery = params.toString();
    router.replace(nextQuery ? `/listings?${nextQuery}` : "/listings", {
      scroll: false,
    });
  }, [searchQuery, typeFilter, exchangeFilter, categoryFilter, router]);

  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const normalizedSearchQuery = searchQuery.toLowerCase();
      const matchesSearch =
        (post.title ?? "").toLowerCase().includes(normalizedSearchQuery) ||
        (post.description ?? "").toLowerCase().includes(normalizedSearchQuery);
      const matchesType = typeFilter === "ALL" || post.postType === typeFilter;
      const matchesExchange =
        exchangeFilter === "ALL" || post.exchangeType === exchangeFilter;
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
    <div className="max-w-7xl mx-auto px-6">
      <ListingsFiltersPanel
        categories={categories}
        categoryFilter={categoryFilter}
        exchangeFilter={exchangeFilter}
        searchQuery={searchQuery}
        typeFilter={typeFilter}
        onCategoryFilterChange={setCategoryFilter}
        onExchangeFilterChange={setExchangeFilter}
        onSearchQueryChange={setSearchQuery}
        onTypeFilterChange={setTypeFilter}
      />
      <ListingsResultsSection
        filteredPosts={filteredPosts}
        loading={loading}
        onClearFilters={clearFilters}
      />
    </div>
  );
}

export default function ListingsPage() {
  return (
    <main className="pt-24 pb-20 min-h-screen bg-slate-50">
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
