"use client";

import { useEffect, useState } from "react";
import { 
  Search, 
  Filter, 
  X, 
  Layers, 
  User, 
  CheckCircle, 
  AlertTriangle, 
  Trash2, 
  Eye, 
  Clock, 
  ExternalLink,
  MapPin,
  Tag,
  Loader2,
  AlertCircle
} from "lucide-react";
import api from "@/lib/axios";
import AdminPagination from "../AdminPagination";

interface ListingItem {
  postId: number;
  title: string;
  description: string;
  category: string;
  postType: string;
  status: string;
  location: string;
  lookingFor: string;
  createdAt: string;
  isGroupOnly: boolean;
  groupId?: number;
  ownerId: number;
  ownerName: string;
  ownerEmail: string;
  reportCount: number;
  flaggedForReview: boolean;
  images?: string[]; // we fetch full details later
}

interface FullListingDetail extends ListingItem {
  postImages?: { postMediaId: number; mediaUrl: string }[];
}

export default function ModerateListings() {
  // Query states
  const [listings, setListings] = useState<ListingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState("FLAGGED"); // FLAGGED default queue
  const [typeFilter, setTypeFilter] = useState("");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Modal / Operations states
  const [selectedPost, setSelectedPost] = useState<FullListingDetail | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [actionPost, setActionPost] = useState<ListingItem | null>(null);
  const [actionType, setActionType] = useState<"approve" | "remove" | "flag" | "close" | "delete" | null>(null);
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchListings = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (keyword) params.append("keyword", keyword);
    if (statusFilter) params.append("status", statusFilter);
    if (typeFilter) params.append("postType", typeFilter);
    params.append("page", page.toString());
    params.append("size", "8");

    api.get(`/api/admin/posts?${params.toString()}`)
      .then(res => {
        setListings(res.data?.data || []);
        setTotalPages(res.data?.totalPages || 1);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching listings:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchListings();
  }, [keyword, statusFilter, typeFilter, page]);

  const handleOpenDetail = (postId: number) => {
    api.get(`/api/admin/posts/${postId}`)
      .then(res => {
        setSelectedPost(res.data?.data);
        setIsDetailOpen(true);
      })
      .catch(err => console.error("Error fetching listing detail:", err));
  };

  const handleAction = () => {
    if (!actionPost || !actionType) return;
    setIsSubmitting(true);

    const payload = { reason };
    let endpoint = `/api/admin/posts/${actionPost.postId}/${actionType}`;

    // adjust endpoints matching controller mappings
    if (actionType === "close") {
      endpoint = `/api/admin/posts/${actionPost.postId}/close`;
    }

    let method: "patch" | "delete" = "patch";
    if (actionType === "delete") {
      endpoint = `/api/admin/posts/${actionPost.postId}`;
      method = "delete";
    }

    const reqPromise = method === "delete"
      ? api.delete(endpoint, { data: payload })
      : api.patch(endpoint, payload);

    reqPromise
      .then(() => {
        alert(`Listing action executed: ${actionType}`);
        setReason("");
        setActionPost(null);
        setActionType(null);
        setIsDetailOpen(false);
        fetchListings();
        setIsSubmitting(false);
      })
      .catch(err => {
        console.error("Moderation action error:", err);
        alert(err.response?.data?.message || "Failed to execute moderation action.");
        setIsSubmitting(false);
      });
  };

  return (
    <div className="space-y-6 relative min-h-[80vh]">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">Listing Moderation</h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
          Approve, flag, force-expire, or remove items/services posted by users that violate trading policies.
        </p>
      </div>

      {/* Filter Row */}
      <div className="flex flex-wrap items-center gap-4 bg-slate-100 dark:bg-slate-900/40 p-4 rounded-2xl border border-slate-200 dark:border-slate-800/80 backdrop-blur-md">
        <div className="flex-1 min-w-[240px] relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search listings by title or category..."
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-800 dark:text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 transition-all font-semibold"
            value={keyword}
            onChange={(e) => { setKeyword(e.target.value); setPage(0); }}
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter size={14} className="text-slate-500" />
          <select
            className="bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:border-indigo-500/50 transition-all cursor-pointer font-semibold"
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}
          >
            <option value="">All Statuses</option>
            <option value="FLAGGED">Flagged Queue</option>
            <option value="ACTIVE">Active</option>
            <option value="CLOSED">Closed/Expired</option>
          </select>

          <select
            className="bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:border-indigo-500/50 transition-all cursor-pointer font-semibold"
            value={typeFilter}
            onChange={(e) => { setTypeFilter(e.target.value); setPage(0); }}
          >
            <option value="">All Types</option>
            <option value="ITEM">Items</option>
            <option value="SERVICE">Services</option>
          </select>
        </div>
      </div>

      {/* Grid of Listings */}
      {loading ? (
        <div className="h-96 flex flex-col items-center justify-center">
          <Loader2 className="animate-spin text-indigo-500 mb-4" size={32} />
          <p className="text-slate-600 dark:text-slate-400 font-medium text-sm">Querying active post inventory...</p>
        </div>
      ) : listings.length === 0 ? (
        <div className="h-96 flex flex-col items-center justify-center text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-slate-850 bg-slate-100 dark:bg-slate-900/10 rounded-2xl">
          <Layers size={40} className="text-slate-600 mb-3" />
          <p className="font-semibold text-sm">No postings matched search filters.</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {listings.map((post) => (
              <div 
                key={post.postId} 
                className={`bg-slate-100 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-800/80 rounded-2xl overflow-hidden backdrop-blur-md flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-xl relative ${
                  post.reportCount > 0 ? "ring-1 ring-red-500/30" : ""
                }`}
              >
                {/* Warning reported bubble */}
                {post.reportCount > 0 && (
                  <span className="absolute top-3 left-3 bg-red-500/15 border border-red-500/30 text-red-600 dark:text-red-400 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full flex items-center gap-1 z-10 ">
                    <AlertCircle size={10} />
                    Reported {post.reportCount}x
                  </span>
                )}

                {/* Card Header Info */}
                <div className="p-5 space-y-4 mt-4">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-black uppercase bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 px-2 py-0.5 rounded-md text-slate-600 dark:text-slate-400 tracking-wider">
                      {post.postType}
                    </span>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                      post.status === "ACTIVE" 
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" 
                        : post.status === "FLAGGED"
                        ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                        : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                    }`}>
                      {post.status}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-800 dark:text-slate-200 line-clamp-1 hover:text-indigo-600 dark:text-indigo-400 transition-colors cursor-pointer" onClick={() => handleOpenDetail(post.postId)}>
                      {post.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                      {post.description}
                    </p>
                  </div>
                </div>

                {/* Card Footer details */}
                <div className="px-5 py-4 border-t border-slate-200 dark:border-slate-800/60 bg-white dark:bg-slate-950/20 flex justify-between items-center text-xs gap-3">
                  <span className="text-slate-500 flex items-center gap-1 min-w-0" title={post.ownerName}>
                    <User size={12} className="text-slate-600 shrink-0" />
                    <span className="truncate">{post.ownerName}</span>
                  </span>
                  <button
                    onClick={() => handleOpenDetail(post.postId)}
                    className="shrink-0 text-[11px] bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 font-bold px-2.5 py-1 rounded-md transition-all cursor-pointer flex items-center gap-1"
                  >
                    <Eye size={12} />
                    Inspect
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {!loading && (
            <AdminPagination 
              currentPage={page} 
              totalPages={totalPages} 
              onPageChange={setPage} 
            />
          )}
        </div>
      )}

      {/* Listing Detail Inspector Modal */}
      {isDetailOpen && selectedPost && (
        <div className="fixed inset-0 flex items-center justify-center z-100 p-4">
          <div className="fixed inset-0 bg-slate-900/40 dark:bg-slate-950/60 backdrop-blur-md transition-opacity" onClick={() => setIsDetailOpen(false)} />
          
          <div className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-2xl overflow-hidden relative z-10 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col shadow-[0_0_50px_rgba(0,0,0,0.8)]">
            
            {/* Header */}
            <div className="p-6 border-b border-slate-200 dark:border-slate-800/60 flex items-center justify-between bg-white dark:bg-slate-950/20 shrink-0">
              <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-sm tracking-widest uppercase">
                <Layers size={16} />
                Moderation Post Inspector ID #{selectedPost.postId}
              </div>
              <button onClick={() => setIsDetailOpen(false)} className="text-slate-500 hover:text-slate-700 dark:text-slate-300 cursor-pointer">
                <X size={20} />
              </button>
            </div>

            {/* Scroll Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {/* Title & Description */}
              <div className="space-y-2">
                <div className="flex justify-between items-start">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">{selectedPost.title}</h3>
                  <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                    selectedPost.status === "ACTIVE" 
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" 
                      : selectedPost.status === "FLAGGED"
                      ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                      : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                  }`}>
                    {selectedPost.status}
                  </span>
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed bg-white dark:bg-slate-950/40 p-4 border border-slate-200 dark:border-slate-800 rounded-xl font-semibold">
                  {selectedPost.description}
                </p>
              </div>

              {/* Images preview */}
              {selectedPost.postImages && selectedPost.postImages.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest">Listing Images</h4>
                  <div className="grid grid-cols-3 gap-3">
                    {selectedPost.postImages.map((img) => (
                      <div key={img.postMediaId} className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden aspect-video bg-white dark:bg-slate-950/40 p-1 flex items-center justify-center">
                        <img src={img.mediaUrl} alt="Post asset" className="max-h-full max-w-full object-contain rounded-lg" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Metadata Parameters */}
              <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-slate-700 dark:text-slate-300">
                <div className="p-3 bg-white dark:bg-slate-950/20 border border-slate-300 dark:border-slate-850 rounded-xl space-y-1">
                  <span className="text-slate-500 flex items-center gap-1.5"><Tag size={12} /> Category</span>
                  <span className="block text-slate-800 dark:text-slate-200">{selectedPost.category}</span>
                </div>
                <div className="p-3 bg-white dark:bg-slate-950/20 border border-slate-300 dark:border-slate-850 rounded-xl space-y-1">
                  <span className="text-slate-500 flex items-center gap-1.5"><MapPin size={12} /> Location</span>
                  <span className="block text-slate-800 dark:text-slate-200">{selectedPost.location || "Not Specified"}</span>
                </div>
                <div className="p-3 bg-white dark:bg-slate-950/20 border border-slate-300 dark:border-slate-850 rounded-xl space-y-1">
                  <span className="text-slate-500 flex items-center gap-1.5"><Eye size={12} /> Looking For</span>
                  <span className="block text-slate-800 dark:text-slate-200 truncate">{selectedPost.lookingFor || "Anything"}</span>
                </div>
                <div className="p-3 bg-white dark:bg-slate-950/20 border border-slate-300 dark:border-slate-850 rounded-xl space-y-1">
                  <span className="text-slate-500 flex items-center gap-1.5"><Clock size={12} /> Submitted</span>
                  <span className="block text-slate-800 dark:text-slate-200">{new Date(selectedPost.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Owner card */}
              <div className="p-4 bg-white dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800/80 rounded-2xl flex items-center gap-3">
                <div className="size-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-extrabold text-sm border border-slate-700">
                  {selectedPost.ownerName.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Listing Author / Owner</span>
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{selectedPost.ownerName}</p>
                  <p className="text-xs text-slate-500">{selectedPost.ownerEmail} (UID: {selectedPost.ownerId})</p>
                </div>
              </div>

              {/* Moderation Actions Inside detail view */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800/40 space-y-3">
                <h4 className="text-xs font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest">Moderator Action Console</h4>
                
                <div className="flex flex-wrap gap-3">
                  {selectedPost.status !== "ACTIVE" && (
                    <button 
                      onClick={() => { setActionPost(selectedPost); setActionType("approve"); }}
                      className="px-4 py-2.5 bg-emerald-600/10 hover:bg-emerald-600/20 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold rounded-xl cursor-pointer transition-all flex items-center gap-1"
                    >
                      <CheckCircle size={14} />
                      Approve post
                    </button>
                  )}

                  {selectedPost.status === "ACTIVE" && (
                    <button 
                      onClick={() => { setActionPost(selectedPost); setActionType("flag"); }}
                      className="px-4 py-2.5 bg-amber-600/10 hover:bg-amber-600/20 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-bold rounded-xl cursor-pointer transition-all flex items-center gap-1"
                    >
                      <AlertTriangle size={14} />
                      Flag post
                    </button>
                  )}

                  {(selectedPost.status === "ACTIVE" || selectedPost.status === "FLAGGED") && (
                    <button 
                      onClick={() => { setActionPost(selectedPost); setActionType("close"); }}
                      className="px-4 py-2.5 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl cursor-pointer transition-all flex items-center gap-1"
                    >
                      <Clock size={14} />
                      Force close/expire
                    </button>
                  )}

                  {selectedPost.status !== "REMOVED" && selectedPost.status !== "CLOSED" && (
                    <button 
                      onClick={() => { setActionPost(selectedPost); setActionType("remove"); }}
                      className="px-4 py-2.5 bg-red-50 dark:bg-red-950/20 hover:bg-red-100 dark:hover:bg-red-950/40 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 text-xs font-bold rounded-xl cursor-pointer transition-all flex items-center gap-1"
                    >
                      <Trash2 size={14} />
                      Remove Listing
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-800/60 bg-white dark:bg-slate-950/20 shrink-0 text-xs text-slate-500 flex justify-between">
              <span>Listing UID: #{selectedPost.postId}</span>
              <span>Owner UID: {selectedPost.ownerId}</span>
            </div>
          </div>
        </div>
      )}

      {/* Action confirmation dialog */}
      {actionPost && actionType && (
        <div className="fixed inset-0 flex items-center justify-center z-150 animate-in fade-in duration-200 p-4">
          <div className="fixed inset-0 bg-slate-900/40 dark:bg-slate-950/60 backdrop-blur-md transition-opacity" onClick={() => { setActionPost(null); setActionType(null); }} />
          
          <div className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 relative z-10 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold">
              <AlertTriangle size={18} />
              Confirm Listing Action
            </div>
            
            <p className="text-sm text-slate-700 dark:text-slate-300">
              Provide official reason for executing <span className="font-black text-indigo-600 dark:text-indigo-400 uppercase">{actionType}</span> on listing <span className="font-bold text-slate-800 dark:text-slate-200">"{actionPost.title}"</span>.
            </p>

            <textarea
              className="w-full h-24 p-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-700 dark:text-slate-300 placeholder-slate-600 focus:outline-none focus:border-indigo-500/40 transition-all font-semibold"
              placeholder="Enter official reason..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />

            <div className="flex justify-end gap-3 text-xs font-bold">
              <button 
                onClick={() => { setActionPost(null); setActionType(null); }} 
                className="px-4 py-2.5 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700/60 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl cursor-pointer transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={handleAction} 
                disabled={isSubmitting || !reason}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white rounded-xl cursor-pointer transition-all flex items-center gap-2"
              >
                {isSubmitting && <Loader2 size={12} className="animate-spin" />}
                Execute
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
