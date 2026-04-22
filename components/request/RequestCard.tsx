"use client";
import { useState, useEffect } from "react";
import {
  Check,
  X,
  ArrowRightLeft,
  Clock,
  Loader2,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import api from "@/lib/axios";

export default function RequestCard({
  request,
  onActionComplete,
}: {
  request: any;
  onActionComplete: (id: number) => void;
}) {
  const [isAccepting, setIsAccepting] = useState(false);
  const [isDeclining, setIsDeclining] = useState(false);

 
  const [senderProfileImage, setSenderProfileImage] = useState<string | null>(
    null,
  );

  const { requestedPost, offeredPost, requestSender, id, createdAt } = request;


  useEffect(() => {
    if (requestSender?.id) {
      api
        .get(`/api/profile/byUserId/${requestSender.id}`)
        .then((res) => setSenderProfileImage(res.data?.profileImage))
        .catch((err) => console.error("Failed to load avatar", err));
    }
  }, [requestSender?.id]);


  const date = new Date(createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  const handleAccept = async () => {
    setIsAccepting(true);
    try {
      await api.post(`/api/direct-swap/accept-request/${id}`);
      toast.success("Trade Accepted!", {
        description: "You can now chat with the trader.",
      });
      onActionComplete(id);
    } catch (err) {
      toast.error("Failed to accept trade.");
      setIsAccepting(false);
    }
  };

  const handleDecline = async () => {
    if (!window.confirm("Are you sure you want to decline this offer?")) return;
    setIsDeclining(true);
    try {
      await api.post(`/api/direct-swap/${id}/decline`);
      toast.success("Trade Declined");
      onActionComplete(id);
    } catch (err) {
      toast.error("Failed to decline trade.");
      setIsDeclining(false);
    }
  };

  const renderPostPreview = (post: any, label: string) => {
    const image = post?.postImages;
    return (
      <div className="flex-1 bg-slate-50 p-3 rounded-2xl border border-slate-100 flex flex-col gap-3 relative group">
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
          {label}
        </span>
        <div className="flex items-center gap-3">
          <div className="size-16 rounded-xl bg-white border border-slate-200 overflow-hidden shrink-0">
            {image && image[0] ? (
              <img
                src={image[0]?.postImageUrl}
                className="w-full h-full object-cover"
                alt=""
              />
            ) : (
              <div className="w-full h-full bg-slate-200" />
            )}
          </div>
          <div className="min-w-0">
            <h4 className="font-bold text-slate-900 truncate text-sm">
              {post?.title || "Untitled Post"}
            </h4>
            <p className="text-xs font-bold text-indigo-600 truncate mt-0.5">
              {post?.item?.estimatedValue
                ? `${post.item.estimatedValue} ETB`
                : "Service"}
            </p>
          </div>
        </div>
        <Link
          href={`/post/${post?.postId}`}
          className="absolute top-3 right-3 text-slate-300 hover:text-indigo-600 transition-colors cursor-pointer"
        >
          <ExternalLink size={16} />
        </Link>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-[2rem] p-6 shadow-xl shadow-slate-200/40 border border-slate-100 flex flex-col gap-6 transition-all hover:border-indigo-100">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-black text-sm shrink-0 border-2 border-white shadow-sm overflow-hidden">
           
            {senderProfileImage ? (
              <img
                src={senderProfileImage}
                className="w-full h-full object-cover"
                alt=""
              />
            ) : (
              requestSender?.name?.[0]?.toUpperCase() || "U"
            )}
          </div>
          <div>
            <p className="font-bold text-slate-900 text-sm">
              <Link
                href={`/profile/${requestSender?.id}`}
                className="hover:text-indigo-600 transition-colors"
              >
                {requestSender?.name}
              </Link>
            </p>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Sent an offer
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-slate-400 text-xs font-medium bg-slate-50 px-3 py-1.5 rounded-full">
          <Clock size={12} /> {date}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
        {renderPostPreview(requestedPost, "They Want")}

        <div className="size-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-500 shrink-0 border-4 border-white shadow-sm z-10 -my-4 sm:my-0">
          <ArrowRightLeft size={16} strokeWidth={2.5} />
        </div>

        {renderPostPreview(offeredPost, "They Offer")}
      </div>

      <div className="grid grid-cols-2 gap-3 pt-2">
        <button
          onClick={handleDecline}
          disabled={isDeclining || isAccepting}
          className="py-3 px-4 rounded-xl text-slate-500 font-bold bg-slate-50 hover:bg-red-50 hover:text-red-600 transition-colors disabled:opacity-50 flex justify-center items-center gap-2 text-sm border border-slate-100 cursor-pointer"
        >
          {isDeclining ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <>
              <X size={18} /> Decline
            </>
          )}
        </button>
        <button
          onClick={handleAccept}
          disabled={isAccepting || isDeclining}
          className="py-3 px-4 rounded-xl text-white font-black bg-indigo-600 hover:bg-indigo-700 transition-all active:scale-95 shadow-lg shadow-indigo-500/20 disabled:opacity-50 flex justify-center items-center gap-2 text-sm cursor-pointer"
        >
          {isAccepting ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <>
              <Check size={18} /> Accept Offer
            </>
          )}
        </button>
      </div>
    </div>
  );
}
