"use client";
import { useState } from "react";
import { Image as ImageIcon } from "lucide-react";

export default function PostImageGallery({
  images,
  title,
}: {
  images: any[];
  title: string;
}) {
  // Safe fallback if backend sends empty images
  const safeImages =
    images?.length > 0
      ? images
      : [
          {
            postImageUrl:
              "https://images.unsplash.com/photo-1586769852044-692d6e3703f0?q=80&w=1000&auto=format&fit=crop",
          },
        ];

  return (
    <div className="w-full individual-post">
      {/* --- DESKTOP VIEW (Airbnb Style Grid) --- */}
      <div className="hidden md:grid grid-cols-4 grid-rows-2 gap-4   overflow-hidden">
        {/* Main Large Image */}
        <div
          className={`relative aspect-video ${safeImages.length === 1 ? "col-span-4 row-span-2" : "col-span-2 row-span-2"}`}
        >
          <img
            src={safeImages[0].postImageUrl}
            alt={`${title} - Main`}
            className="w-full h-full object-cover hover:scale-105  transition-transform duration-700 cursor-pointer"
          />
        </div>

        {/* Additional Images (Up to 4 more) */}
        {safeImages.slice(1, 5).map((img, idx) => (
          <div
            key={idx}
            className="relative col-span-1 row-span-1 overflow-hidden aspect-video"
          >
            <img
              src={img.postImageUrl}
              alt={`${title} - Angle ${idx + 2}`}
              className="w-full h-full object-cover hover:scale-110 transition-transform duration-700 cursor-pointer"
            />
            {/* If there are more than 5 images, show an overlay on the last one */}
            {/* {idx === 3 && images.length > 5 && (
              <div className="absolute inset-0 bg-slate-900/40 flex items-center justify-center backdrop-blur-sm cursor-pointer hover:bg-slate-900/50 transition-all">
                <span className="text-white font-black text-xl flex items-center gap-2">
                  <ImageIcon size={24} /> +{images.length - 5}
                </span>
              </div>
            )} */}
          </div>
        ))}
      </div>

      {/* --- MOBILE VIEW (Swipeable Scroll) --- */}
      <div className="md:hidden flex overflow-x-auto hide-scrollbar snap-x snap-mandatory aspect-16/10 rounded  ">
        {safeImages.map((img, idx) => (
          <div key={idx} className="w-full shrink-0 snap-center relative">
            <img
              src={img.postImageUrl}
              alt={`${title} - Angle ${idx + 1}`}
              className="w-full h-full object-cover"
            />
            {/* Mobile Pagination Counter */}
            <div className="absolute bottom-4 right-4 bg-slate-900/70 text-white text-xs font-bold px-3 py-1.5 rounded-full backdrop-blur-md">
              {idx + 1} / {safeImages.length}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
