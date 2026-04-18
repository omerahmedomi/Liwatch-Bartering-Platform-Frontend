"use client";
import { useState, Suspense, use, useEffect } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { ShieldAlert, User, Clock, ArrowRightLeft, CheckCircle, Edit, Loader2, AlertTriangleIcon } from "lucide-react";
import api from "@/lib/axios";
import Link from "next/link";

function ActionButton({ 
  fetchPromise, 
  postUserId, 
  onInitiate 
}: { 
  fetchPromise: Promise<any>, 
  postUserId: number, 
  onInitiate: () => void 
}) {
  
const { userProfile, hasRequested } = use(fetchPromise);
const currentUserId = userProfile?.user?.id;


 //own post
  if (currentUserId === postUserId) {
    return (
      <button disabled className="w-full bg-slate-50 text-slate-400 font-black uppercase tracking-widest py-4 rounded-lg flex items-center justify-center gap-2 border border-slate-200 cursor-not-allowed text-sm">
        <Edit size={18} /> Your Post
      </button>
    );
  }

 // request already sent
  if (hasRequested) {
    return (
      <button disabled className="w-full bg-emerald-50 text-emerald-600 font-black uppercase tracking-widest py-4 rounded-lg flex items-center justify-center gap-2 border border-emerald-200 cursor-not-allowed text-sm">
        <CheckCircle size={20} strokeWidth={2.5} /> Request Pending
      </button>
    );
  }

 
  return (
    <button
      onClick={onInitiate}
      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase tracking-widest py-4 rounded-lg flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-indigo-500/20 text-sm group cursor-pointer"
    >
      <ArrowRightLeft size={20} strokeWidth={2.5} className="group-hover:rotate-x-180 transition-transform duration-500" />
      Send Request
    </button>
  );
}

function TraderCard({
  fetchPromise,
  authorName,
  authorEmail,
}: {
  fetchPromise: Promise<any>;
  authorName: string;
  authorEmail: string;
}) {

  const authorProfileRes = use(fetchPromise);
  console.log(authorProfileRes)
  const profileId = authorProfileRes?.data?.profileId;
  const profileImage = authorProfileRes?.data?.profileImage;
  

  return (
    <div className="bg-white p-6 border-l-3 border-indigo-700">
      <h3 className="font-bold text-slate-900 mb-4">About the Trader</h3>

      <div className="flex items-center gap-4 mb-6">
        <div
          className="size-14 rounded-full bg-indigo-50 flex items-center justify-center border border-indigo-100 shrink-0 bg-center bg-cover"
          style={{ backgroundImage: `url(${profileImage})` }}
        >
          {!profileImage && <User size={24} className="text-indigo-400" />}
        </div>
        <Link className="min-w-0" href={`/profile/${profileId}`}>
          
          <div className="font-black text-slate-900 hover:text-indigo-600 transition-colors ">
            {authorName}
          </div>
          <p className="text-sm text-slate-500 font-medium text-wrap break-all">
            {authorEmail}
          </p>
        </Link>
      </div>

      <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
        <button className="text-xs font-bold text-slate-400 hover:text-red-500 flex items-center gap-1.5 transition-colors cursor-pointer">
          <ShieldAlert size={14} /> Report User
        </button>
      </div>
    </div>
  );
}
export default function PostSidebar({ post }: { post: any }) {
  console.log(post)

  const isService = post?.postType === "SERVICE";
  const authorName = post?.user?.name || "Anonymous Trader";

  
  const [userContextPromise] = useState(() =>
    api
      .get("/api/profile/me")
      .then(async (res) => {
        const userProfile = res.data;
        const userId = userProfile?.user?.id;
        let hasRequested = false;

        // Check request ONLY if logged in and NOT the author
        if (userId && userId !== post?.user?.id) {
          try {
            const checkRes = await api.post(
              `/api/direct-swap/check-request/${userId}/${post?.postId}`,
            );
            hasRequested = checkRes.data.exists;
          } catch (e) {
            console.error("Swap check failed", e);
          }
        }
        return { userProfile, hasRequested };
      })
      .catch(() => ({ userProfile: null, hasRequested: false })),
  );
  const [authorProfilePromise] = useState(()=>
  
  api.get(`/api/profile/byUserId/${post?.user?.id}`))

  const handleInitiateBarter = () => {
  
    alert("Opening Barter Offer Modal... (To be implemented)");
  };

  return (
    <div className="sticky top-28 space-y-6">
      <div className="bg-white p-6 shadow-xl shadow-slate-200/50 border-l-3 border-indigo-700">
        <div className="flex justify-between items-start mb-6">
          <div>
            <p className="text-slate-500 font-bold text-xs uppercase tracking-widest mb-1">
              {isService ? "Service Level" : "Item Condition"}
            </p>
            <p className="font-black text-slate-900">
              {isService ? post?.service?.skillLevel : post?.item?.condition}
            </p>
          </div>
          {post?.exchangeType === "TEMPORARY" && (
            <div className="bg-amber-50 text-amber-600 px-3 py-1.5 rounded-xl flex items-center gap-2 text-xs font-black uppercase tracking-wider border border-amber-100">
              <Clock size={14} /> Temp
            </div>
          )}
        </div>

        {!isService && post?.item?.estimatedValue && (
          <div className="mb-6 p-4 bg-slate-50 rounded-lg border border-slate-100">
            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">
              Estimated Value
            </p>
            <p className="text-indigo-600 font-black text-lg">
              {post.item.estimatedValue} ETB
            </p>
          </div>
        )}
        <ErrorBoundary
          fallback={
            <span className="text-red-500 text-sm flex font-extrabold gap-x-1 items-center">
              <AlertTriangleIcon strokeWidth={3} size={17} /> Something Went
              Wrong!
            </span>
          }
        >
          <Suspense
            fallback={
              <button
                disabled
                className="w-full bg-slate-50 text-slate-400 py-4 rounded-lg flex items-center justify-center border border-slate-100 text-sm"
              >
                <Loader2 className="animate-spin text-indigo-600" size={20} />
              </button>
            }
          >
            <ActionButton
              fetchPromise={userContextPromise}
              postUserId={post?.user?.id}
              onInitiate={handleInitiateBarter}
            />
          </Suspense>
        </ErrorBoundary>
      </div>

      <ErrorBoundary
        fallback={
          <span className="text-red-500 text-sm font-extrabold">
            Failed to load trader info
          </span>
        }
      >
        <Suspense
          fallback={
            <div className="bg-white p-6 border-l-3 border-indigo-700 animate-pulse h-40" />
          }
        >
          <TraderCard
            fetchPromise={authorProfilePromise}
            authorName={authorName}
            authorEmail={post?.user?.email}
          />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}