"use client";
import { useEffect, useState } from "react";
import { Star, MessageSquare, Calendar } from "lucide-react";
import api from "@/lib/axios";

interface RatingResponse {
  ratingId: number;
  fromUserId: number;
  fromUserName: string;
  fromUserProfileImage?: string | null;
  score: number;
  comment: string | null;
  publishedAt: string;
}

export default function ProfileReviewsList({ userId }: { userId: number }) {
  const [reviews, setReviews] = useState<RatingResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;

    const fetchReviews = async () => {
      try {
        const response = await api.get(`/api/users/${userId}/ratings`);
        setReviews(response.data || []);
      } catch (err: any) {
        console.error("Error fetching user reviews", err);
        setError("Failed to load reviews.");
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [userId]);

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm space-y-4 animate-pulse">
        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/4" />
        <div className="space-y-3">
          <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-full" />
          <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-5/6" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm text-center text-xs text-red-500 font-semibold">
        {error}
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 shadow-sm rounded-2xl overflow-hidden flex flex-col p-6 space-y-6">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-2">
          <MessageSquare className="text-indigo-600" size={18} />
          <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm tracking-tight">
            User Reviews & Ratings
          </h3>
        </div>
        <span className="bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400 text-xs font-bold px-2.5 py-1 rounded-md">
          {reviews.length} {reviews.length === 1 ? "Review" : "Reviews"}
        </span>
      </div>

      {reviews.length === 0 ? (
        <div className="text-center py-8 space-y-2">
          <Star className="mx-auto text-slate-300 dark:text-slate-700" size={32} />
          <p className="text-sm font-semibold text-slate-650 dark:text-slate-400">
            No reviews yet
          </p>
          <p className="text-xs text-slate-400">
            Reviews will appear here once exchanges are completed and ratings are published.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-slate-100 dark:divide-slate-800/60 space-y-5">
          {reviews.map((review, idx) => (
            <div
              key={review.ratingId}
              className={`pt-5 first:pt-0 space-y-2.5 animate-in fade-in duration-300 delay-[${idx * 50}ms]`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="size-9 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center overflow-hidden shrink-0">
                    {review.fromUserProfileImage ? (
                      <img
                        src={review.fromUserProfileImage}
                        alt={review.fromUserName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-xs font-black text-slate-400 uppercase">
                        {review.fromUserName.charAt(0)}
                      </span>
                    )}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                      {review.fromUserName}
                    </h4>
                    <div className="flex items-center gap-1 mt-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          size={12}
                          className={
                            star <= review.score
                              ? "fill-amber-400 text-amber-500"
                              : "text-slate-200 dark:text-slate-800"
                          }
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <span className="text-[10px] text-slate-400 dark:text-slate-500 flex items-center gap-1">
                  <Calendar size={12} />
                  {new Date(review.publishedAt).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>

              {review.comment ? (
                <p className="text-sm text-slate-650 dark:text-slate-350 leading-relaxed italic">
                  "{review.comment}"
                </p>
              ) : (
                <p className="text-xs text-slate-405 italic">Rating left without a comment.</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
