"use client";
import { useState, Suspense, use, useEffect } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { ShieldAlert, User, Clock, ArrowRightLeft, CheckCircle, Edit, Loader2, AlertTriangleIcon, Heart } from "lucide-react";
import api from "@/lib/axios";
import Link from "next/link";
import BarterOfferModal from "../request/BarterOfferModal";
import ReportModal from "@/components/ReportModal";
import EditPostModal from "@/components/profile/EditPostModal";
import { toast } from "sonner";

function ActionButton({ 
  fetchPromise, 
  postUserId, 
  onInitiate,
  onEdit
}: { 
  fetchPromise: Promise<any>; 
  postUserId: number; 
  onInitiate: () => void;
  onEdit: () => void;
}) {
  
const { userProfile, hasRequested } = use(fetchPromise);
const currentUserId = userProfile?.user?.id;

console.log("Has requested",hasRequested);
  if (currentUserId === postUserId) {
    return (
      <button onClick={onEdit} className="w-full bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-900 text-indigo-600 font-black uppercase tracking-widest py-4 rounded-lg flex items-center justify-center gap-2 border border-slate-200 dark:border-slate-800 cursor-pointer transition-colors text-sm">
        <Edit size={18} /> Edit Your Post
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
  badgeLevel,
  onReportUser,
}: {
  fetchPromise: Promise<any>;
  authorName: string;
  authorEmail: string;
  badgeLevel?: string | null;
  onReportUser?: () => void;
}) {

  const authorProfileRes = use(fetchPromise);
  console.log(authorProfileRes)
  const profileId = authorProfileRes?.data?.profileId;
  const profileImage = authorProfileRes?.data?.profileImage;
  

  return (
    <div className="bg-white dark:bg-slate-900 p-6 border-l-3 border-indigo-700">
      <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-4">About the Trader</h3>

      <div className="flex items-center gap-4 mb-6">
        <div
          className="size-14 rounded-full bg-indigo-50 flex items-center justify-center border border-indigo-100 shrink-0 bg-center bg-cover"
          style={{ backgroundImage: `url(${profileImage})` }}
        >
          {!profileImage && <User size={24} className="text-indigo-400" />}
        </div>
        <Link className="min-w-0 flex-1" href={`/profile/${profileId}`}>
          
          <div className="font-black text-slate-900 dark:text-slate-100 hover:text-indigo-600 transition-colors flex items-center gap-2 flex-wrap">
            {authorName}
            {badgeLevel && (
              <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-700 border border-amber-200">
                {badgeLevel.replace(/_/g, " ")}
              </span>
            )}
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium text-wrap break-all">
            {authorEmail}
          </p>
        </Link>
      </div>

      <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
        <button onClick={onReportUser} className="text-xs font-bold text-slate-400 hover:text-red-500 flex items-center gap-1.5 transition-colors cursor-pointer">
          <ShieldAlert size={14} /> Report User
        </button>
      </div>
    </div>
  );
}
function WishlistButton({ postId }: { postId: number }) {
  const [inWishlist, setInWishlist] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    api.get(`/api/wishlist/status/${postId}`)
      .then((res) => {
        if (isMounted) {
          setInWishlist(res.data.inWishlist);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error("Failed to check wishlist status:", err);
        if (isMounted) setLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, [postId]);

  const handleToggle = async () => {
    try {
      setLoading(true);
      const res = await api.post(`/api/wishlist/toggle/${postId}`);
      setInWishlist(res.data.inWishlist);
      if (res.data.inWishlist) {
        toast.success("Added to Wishlist", {
          description: "You can view this listing in your wishlist later.",
        });
      } else {
        toast.success("Removed from Wishlist", {
          description: "The listing was removed from your wishlist.",
        });
      }
    } catch (err) {
      console.error("Failed to toggle wishlist:", err);
      toast.error("Action Failed", {
        description: "Something went wrong. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <button
        disabled
        className="w-full bg-slate-50 dark:bg-slate-950 text-slate-400 py-3 rounded-lg flex items-center justify-center border border-slate-100 dark:border-slate-800 text-sm"
      >
        <Loader2 className="animate-spin text-indigo-600" size={18} />
      </button>
    );
  }

  return (
    <button
      onClick={handleToggle}
      className={`w-full py-3 px-4 rounded-lg flex items-center justify-center gap-2 border font-bold text-sm tracking-wider uppercase transition-all duration-200 cursor-pointer ${
        inWishlist
          ? "bg-red-50 dark:bg-red-950/20 text-red-600 border-red-200 dark:border-red-900/50 hover:bg-red-100 dark:hover:bg-red-950/40"
          : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/80"
      }`}
    >
      <Heart
        size={18}
        className={inWishlist ? "fill-red-600 text-red-600" : "text-slate-400"}
      />
      {inWishlist ? "Saved in Wishlist" : "Add to Wishlist"}
    </button>
  );
}

function PostSecondaryActions({
  userContextPromise,
  authorProfilePromise,
  post,
  onReportListing,
  onReportUser,
  authorName,
  authorEmail,
  badgeLevel
}: {
  userContextPromise: Promise<any>;
  authorProfilePromise: Promise<any>;
  post: any;
  onReportListing: () => void;
  onReportUser: () => void;
  authorName: string;
  authorEmail: string;
  badgeLevel?: string | null;
}) {
  const { userProfile } = use(userContextPromise);
  const currentUserId = userProfile?.user?.id;

  if (currentUserId === post?.user?.id) {
    return null;
  }

  return (
    <>
      <div className="mt-3">
        <WishlistButton postId={post.postId} />
      </div>

      {/* Report Listing Button */}
      <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
        <button
          onClick={onReportListing}
          className="w-full flex items-center justify-center gap-2 text-red-500 font-bold py-2 rounded-lg text-xs hover:bg-red-50 transition-colors cursor-pointer"
        >
          <AlertTriangleIcon size={14} />
          Report this Listing
        </button>
      </div>

      <ErrorBoundary
        fallback={
          <span className="text-red-500 text-sm font-extrabold mt-6 block">
            Failed to load trader info
          </span>
        }
      >
        <Suspense
          fallback={
            <div className="bg-white dark:bg-slate-900 p-6 border-l-3 border-indigo-700 animate-pulse h-40 mt-6" />
          }
        >
          <div className="mt-6">
            <TraderCard
              fetchPromise={authorProfilePromise}
              authorName={authorName}
              authorEmail={authorEmail}
              badgeLevel={badgeLevel}
              onReportUser={onReportUser}
            />
          </div>
        </Suspense>
      </ErrorBoundary>
    </>
  );
}

export default function PostSidebar({ post }: { post: any }) {
  console.log(post)
   const [isModalOpen, setIsModalOpen] = useState(false);
   const [isEditModalOpen, setIsEditModalOpen] = useState(false);
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
          
            hasRequested = checkRes.data;
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



  const [isReportListingOpen, setIsReportListingOpen] = useState(false);
  const [isReportUserOpen, setIsReportUserOpen] = useState(false);

 const handleInitiateBarter = () => {
   setIsModalOpen(true); 
 };

  // Determine if the logged in user is the author
  // We extract it synchronously using a fallback, but userContextPromise might not have resolved yet.
  // Actually we can check `post.user.id` against the current user in `userContextPromise` by passing a state, but since the post owner should be determined inside ActionButton or here... Let's just render the report buttons directly if the user is authenticated. 
  // We can just rely on the existing layout.

  return (
    <div className="sticky top-28 space-y-6">
      <div className="bg-white dark:bg-slate-900 p-6 shadow-xl shadow-slate-200/50 border-l-3 border-indigo-700">
        <div className="flex justify-between items-start mb-6">
          <div>
            <p className="text-slate-500 dark:text-slate-400 font-bold text-xs uppercase tracking-widest mb-1">
              {isService ? "Service Level" : "Item Condition"}
            </p>
            <p className="font-black text-slate-900 dark:text-slate-100">
              {isService ? post?.service?.skillLevel : post?.item?.condition}
            </p>
          </div>
        </div>

        {!isService && post?.item?.estimatedValue && (
          <div className="mb-6 p-4 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-100 dark:border-slate-800">
            <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">
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
                className="w-full bg-slate-50 dark:bg-slate-950 text-slate-400 py-4 rounded-lg flex items-center justify-center border border-slate-100 dark:border-slate-800 text-sm"
              >
                <Loader2 className="animate-spin text-indigo-600" size={20} />
              </button>
            }
          >
            <ActionButton
              fetchPromise={userContextPromise}
              postUserId={post?.user?.id}
              onInitiate={handleInitiateBarter}
              onEdit={() => setIsEditModalOpen(true)}
            />
          </Suspense>
        </ErrorBoundary>

        <ErrorBoundary fallback={null}>
          <Suspense fallback={null}>
            <PostSecondaryActions
              userContextPromise={userContextPromise}
              authorProfilePromise={authorProfilePromise}
              post={post}
              onReportListing={() => setIsReportListingOpen(true)}
              onReportUser={() => setIsReportUserOpen(true)}
              authorName={authorName}
              authorEmail={post?.user?.email}
              badgeLevel={post?.user?.badgeLevel}
            />
          </Suspense>
        </ErrorBoundary>

      </div>
      <Suspense>
        <BarterOfferModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          wantedPostId={post.postId}
          wantedPostTitle={post.title}
          userContextPromise={userContextPromise}
          requestedUser={post?.user}
        />
      </Suspense>

      {/* Report Modals */}
      {isReportListingOpen && (
        <ReportModal
          targetType="POST"
          targetId={post.postId || post.id}
          onClose={() => setIsReportListingOpen(false)}
          onSuccess={() => alert("Listing reported successfully.")}
        />
      )}
      
      {isReportUserOpen && (
        <ReportModal
          targetType="USER"
          targetId={post?.user?.id}
          onClose={() => setIsReportUserOpen(false)}
          onSuccess={() => alert("User reported successfully.")}
        />
      )}
      
      {isEditModalOpen && (
        <EditPostModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          postId={post.postId || post.id}
          onSuccess={() => window.location.reload()}
        />
      )}
    </div>
  );
}