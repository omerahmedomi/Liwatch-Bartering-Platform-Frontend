"use client";
import { useState, useEffect } from "react";
import { Package, Search, Plus } from "lucide-react";
import api from "@/lib/axios";
import ListingMiniCard from "./ListingMiniCard";
import Link from "next/link";
import { toast } from "sonner";

export default function ProfileActiveListings({
  userId,
  isOwner,
  userName,
}: {
  userId: number;
  isOwner: boolean;
  userName: string;
}) {
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. Fetch listings for this specific user
  const fetchListings = async () => {
    try {
      // Assuming you have an endpoint that returns posts by User ID
      const res = await api.get(`/api/post/userPost/${userId}`);
      setListings(res.data.content);
    } catch (err) {
      console.error("Failed to fetch listings", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) fetchListings();
  }, [userId]);

  // 2. Handle Delete (Passed down to child card)
  const handleDelete = async (postId: number) => {
    try {
      await api.delete(`/api/post/deletePost/${postId}`);
      // Remove from local state instantly for snappy UI
      setListings((prev) => prev.filter((item) => item.postId !== postId));
      toast.success("Listing deleted successfully", {
        description: "Your marketplace has been updated.",
        className:
          "bg-white border-l-4 border-emerald-500 font-bold shadow-2xl p-4",
      });
    } catch (err) {
      toast.error("Could not delete listing");
    }
  };

  return (
    <div className="bg-white p-8 border-l-4 border-indigo-700 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-black text-slate-900 uppercase tracking-widest text-sm">
          Active Listings ({listings.length})
        </h3>
        {isOwner && (
          <Link className="text-indigo-600 flex items-center gap-1 text-xs font-bold hover:underline cursor-pointer" href={`/create-post`}>
            <Plus size={14} /> New Listing
          </Link>
        )}
      </div>

      {loading ? (
        <div className="h-32 flex items-center justify-center">
          <div className="size-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : listings.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {listings.map((item) => (
            <ListingMiniCard
              key={item.postId}
              item={item}
              isOwner={isOwner}
              onDelete={() => handleDelete(item.postId)}
            />
          ))}
        </div>
      ) : (
        <div className="h-40 border-2 border-dashed border-slate-100 rounded-2xl flex flex-col items-center justify-center text-slate-400 gap-2">
          <Search size={24} strokeWidth={1.5} />
          <p className="font-bold text-sm">
            {isOwner
              ? "You haven't posted anything yet."
              : `${userName} has no active listings.`}
          </p>
        </div>
      )}
    </div>
  );
}
