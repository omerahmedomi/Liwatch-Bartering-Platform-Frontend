"use client";
import { useState } from "react";
import { Edit3, Trash2, ExternalLink, Clock, Tag } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import DeleteConfirm from "../DeleteConfirm";

export default function ListingMiniCard({
  item,
  isOwner,
  onDelete,
}: {
  item: any;
  isOwner: boolean;
  onDelete: () => void;
}) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);


  const handleDeleteClick = async () => {
    setIsDeleting(true);
    await onDelete(); // This triggers the handleHideListing in parent
    setShowConfirm(false);
    setIsDeleting(false);
  };

  const isService = item.postType === "SERVICE";
  const displayImage = item.mediaList?.[0]?.mediaUrl || null;

  return (
    <div className="group relative bg-slate-50 border border-slate-100 rounded-xl p-3 flex gap-4 hover:border-indigo-200 transition-all">
      {/* Thumbnail */}
      <div className="size-20 rounded-lg bg-white border border-slate-200 overflow-hidden shrink-0">
        {displayImage ? (
          <img
            src={displayImage}
            className="w-full h-full object-cover"
            alt=""
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-300">
            {isService ? <Clock size={20} /> : <Tag size={20} />}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0 flex flex-col justify-center">
        <h4 className="font-bold text-slate-900 truncate group-hover:text-indigo-600 transition-colors">
          {item.title}
        </h4>
        <p className="text-[10px] font-black uppercase tracking-tighter text-slate-400 mb-1">
          {isService ? item.service?.category : item.item?.category}
        </p>
        <p className="text-xs font-bold text-indigo-600">
          {isService ? "Service" : `${item.item?.estimatedValue} ETB`}
        </p>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-1 justify-center border-l border-slate-200 pl-3">
        {isOwner ? (
          <>
            <button
              onClick={() => router.push(`/listings/edit/${item.postId}`)}
              className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-md transition-all cursor-pointer"
              title="Edit Listing"
            >
              <Edit3 size={16} />
            </button>
            <button
              onClick={() => setShowConfirm(true)} // Trigger the custom modal
              className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-white rounded-md transition-all cursor-pointer"
            >
              <Trash2 size={16} />
            </button>
          </>
        ) : (
          <Link
            href={`/post/${item.postId}`}
            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-md transition-all"
          >
            <ExternalLink size={18} />
          </Link>
        )}
      </div>
      <DeleteConfirm
        isOpen={showConfirm}
        title={item.title}
        isLoading={isDeleting}
        onCancel={() => setShowConfirm(false)}
        onConfirm={handleDeleteClick}
      />
    </div>
  );
}
