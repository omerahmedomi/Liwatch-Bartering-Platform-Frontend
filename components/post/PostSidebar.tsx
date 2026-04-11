"use client";
import {
  ShieldAlert,
  Zap,
  Package,
  User,
  Clock,
  ArrowRightLeft,
} from "lucide-react";

export default function PostSidebar({ post }: { post: any }) {
  const isService = post?.postType === "SERVICE";
  const authorName = post?.user?.name || "Anonymous Trader";

  // UC04 Step 2: User clicks "Send Request"
  const handleInitiateBarter = () => {
    // In the future, this will open a modal where User-1 selects an item
    // from THEIR inventory to offer to User-2.
    alert("Opening Barter Offer Modal... (To be implemented)");
  };

  return (
    <div className="sticky top-28 space-y-6">
      {/* --- ACTION CARD (The Offer Section) --- */}
      <div className="bg-white rounded-[2rem] p-6 shadow-xl shadow-slate-200/50 border border-slate-100">
        <div className="flex justify-between items-start mb-6">
          <div>
            <p className="text-slate-500 font-bold text-xs uppercase tracking-widest mb-1">
              {isService ? "Service Level" : "Item Condition"}
            </p>
            <p className="text-xl font-black text-slate-900">
              {isService ? post?.service?.skillLevel : post?.item?.condition}
            </p>
          </div>

          {post?.exchangeType === "TEMPORARY" && (
            <div className="bg-amber-50 text-amber-600 px-3 py-1.5 rounded-xl flex items-center gap-2 text-xs font-black uppercase tracking-wider border border-amber-100">
              <Clock size={14} /> Temp
            </div>
          )}
        </div>

        {/* Estimated Value (If Item) */}
        {!isService && post?.item?.estimatedValue && (
          <div className="mb-6 p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">
              Estimated Value
            </p>
            <p className="text-indigo-600 font-black text-lg">
              {post.item.estimatedValue} ETB
            </p>
            {post?.item?.partialCashAllowed && (
              <p className="text-xs text-slate-400 font-medium mt-1">
                * Partial cash exchange is accepted
              </p>
            )}
          </div>
        )}

        {/* The Master Call to Action (UC04 Step 2) */}
        <button
          onClick={handleInitiateBarter}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase tracking-widest py-4 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-indigo-500/20"
        >
          <ArrowRightLeft size={20} strokeWidth={2.5} />
          Send Request
        </button>
      </div>

      {/* --- TRADER PROFILE CARD --- */}
      <div className="bg-white rounded-[2rem] p-6 border border-slate-100">
        <h3 className="font-bold text-slate-900 mb-4">About the Trader</h3>

        <div className="flex items-center gap-4 mb-6">
          <div className="size-14 rounded-full bg-indigo-50 flex items-center justify-center border border-indigo-100 shrink-0">
            <User size={24} className="text-indigo-400" />
          </div>
          <div>
            <p className="font-black text-slate-900 text-lg">{authorName}</p>
            <p className="text-sm text-slate-500 font-medium">
              {post?.user?.email}
            </p>
          </div>
        </div>

        {/* Security & Moderation (Supplementary Requirements) */}
        <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
          <button className="text-xs font-bold text-slate-400 hover:text-red-500 flex items-center gap-1.5 transition-colors">
            <ShieldAlert size={14} /> Report User
          </button>
        </div>
      </div>
    </div>
  );
}
