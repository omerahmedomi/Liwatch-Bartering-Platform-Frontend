"use client";
import { useState } from "react";
import Link from "next/link";
import {
  MapPin,
  Package,
  Zap,
  User,
  Clock,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export default function PostCard({ post }: { post: any }) {
    console.log(post)
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // --- Swipe State ---
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchEndX, setTouchEndX] = useState<number | null>(null);
  const minSwipeDistance = 50; // Require 50px of movement to trigger a swipe

  const isService = post?.postType === "SERVICE";

  const images =
    post?.postImages && post.postImages.length > 0
      ? post.postImages
      : [
          {
            postImageUrl:
              "https://images.unsplash.com/photo-1586769852044-692d6e3703f0?q=80&w=1000&auto=format&fit=crop",
          },
        ];

  const hasMultipleImages = images.length > 1;
  const authorName = post?.user?.name || "Anonymous Trader";
  const specificDetail = isService
    ? post?.service?.skillLevel
    : post?.item?.condition;

  // --- Navigation Logic ---
  const handleNext = (e?: React.MouseEvent | React.TouchEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const handlePrev = (e?: React.MouseEvent | React.TouchEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  // --- Mobile Touch Handlers ---
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEndX(null); // Reset end position on new touch
    setTouchStartX(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    // Continuously update the end position as they drag
    setTouchEndX(e.targetTouches[0].clientX);
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartX || !touchEndX) return;

    const distance = touchStartX - touchEndX;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && hasMultipleImages) {
      handleNext(e);
    } else if (isRightSwipe && hasMultipleImages) {
      handlePrev(e);
    }
    // If they didn't swipe far enough, we let the normal click (<Link>) happen
  };

  return (
    <Link href={`/post/${post?.postId}`} className="group block h-full">
      <div className="bg-white h-full flex flex-col rounded-lg border border-slate-100 overflow-hidden hover:shadow-2xl hover:shadow-indigo-100 transition-all duration-500 hover:-translate-y-2">
        {/* ========================================== */}
        {/* TOP: Image Carousel & Floating Badges      */}
        {/* ========================================== */}

        {/* We attach the touch listeners to the image container */}
        <div
          className="relative aspect-square overflow-hidden bg-slate-100 shrink-0 touch-pan-y"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          <img
            src={images[currentImageIndex].postImageUrl}
            alt={post?.title || "Listing image"}
            className="object-cover w-full h-full transition-opacity duration-300 pointer-events-none"
            // pointer-events-none stops the browser from trying to "save image" when dragging
          />

          {hasMultipleImages && (
            <>
              {/* Left Arrow (Visible on Desktop Hover) */}
              <button
                onClick={handlePrev}
                className="absolute hidden sm:block left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-slate-800 p-1.5 rounded-full backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-sm z-20"
              >
                <ChevronLeft size={18} />
              </button>

              {/* Right Arrow (Visible on Desktop Hover) */}
              <button
                onClick={handleNext}
                className="absolute hidden sm:block right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-slate-800 p-1.5 rounded-full backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-sm z-20"
              >
                <ChevronRight size={18} />
              </button>

              {/* Bottom Pagination Dots (Visible on Mobile & Desktop) */}
              <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 z-10">
                {images.map((_: any, idx: number) => (
                  <div
                    key={idx}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      idx === currentImageIndex
                        ? "w-4 bg-white shadow-sm"
                        : "w-1.5 bg-white/60"
                    }`}
                  />
                ))}
              </div>
            </>
          )}

          {/* Master Type Badge (ITEM vs SERVICE) */}
          <div
            className={`absolute top-4 left-4 px-3 py-1.5 rounded-full backdrop-blur-md flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest ${
              isService
                ? "bg-emerald-500/90 text-white shadow-emerald-500/20"
                : "bg-indigo-600/90 text-white shadow-indigo-500/20"
            } shadow-lg z-10`}
          >
            {isService ? <Zap size={12} /> : <Package size={12} />}
            {post?.postType}
          </div>

          {/* Exchange Type Badge */}
          {post?.exchangeType === "TEMPORARY" && (
            <div className="absolute top-4 right-4 px-3 py-1.5 rounded-full backdrop-blur-md bg-amber-500/90 text-white flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest shadow-lg shadow-amber-500/20 z-10">
              <Clock size={12} />
              TEMP
            </div>
          )}
        </div>

        {/* ========================================== */}
        {/* BOTTOM: Text & Metadata                    */}
        {/* ========================================== */}
        <div className="p-6 flex flex-col flex-grow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest bg-indigo-50 px-2.5 py-1 rounded-md">
              {post?.category || "General"}
            </span>
            {specificDetail && (
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                • {specificDetail}
              </span>
            )}
          </div>

          <h3 className="font-black text-slate-900 text-lg leading-tight mb-2 line-clamp-2 group-hover:text-indigo-600 transition-colors">
            {post?.title}
          </h3>

          <p className="text-slate-500 text-sm font-medium line-clamp-2 mb-6 flex-grow">
            {post?.description}
          </p>

          <div className="flex items-center justify-between pt-4 border-t border-slate-50 mt-auto">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200">
                <User size={14} className="text-slate-400" />
              </div>
              <span className="text-xs font-bold text-slate-700 truncate max-w-[100px]">
                {authorName}
              </span>
            </div>
            <div className="flex items-center gap-1 text-slate-400 font-bold text-[10px] uppercase">
              <MapPin size={12} />
              Addis Ababa
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
