"use client";
import { useState, useRef, useEffect } from "react";
import {
  ShieldCheck,
  FileSignature,
  CheckCircle2,
  Clock,
  Lock,
  AlertTriangle,
  Upload,
  Camera,
  Star,
  Users
} from "lucide-react";
import api from "@/lib/axios";
import { uploadToCloudinary } from "@/lib/cloudinary";
import ReportModal from "@/components/ReportModal";

interface CycleDigitalAgreementPanelProps {
  room: any;
  currentUser: any;
  onRefresh: () => void;
}

export default function CycleDigitalAgreementPanel({
  room,
  currentUser,
  onRefresh,
}: CycleDigitalAgreementPanelProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedIdUrl, setUploadedIdUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const req = room.requestDetails;
  const isInitiator = req.initiator.id === currentUser?.id;
  const isMiddleman = req.middleman.id === currentUser?.id;
  const isCloser = req.closer.id === currentUser?.id;

  const mySignStatus = isInitiator ? room.userASigned : isMiddleman ? room.userBSigned : room.userCSigned;
  const isFullySigned = room.userASigned && room.userBSigned && room.userCSigned;
  
  const myUploadedId = isInitiator ? room.userAIdCardUrl : isMiddleman ? room.userBIdCardUrl : room.userCIdCardUrl;
  const isFullyVerified = room.userAIdCardUrl && room.userBIdCardUrl && room.userCIdCardUrl;

  const [ratings, setRatings] = useState<any[]>([]);
  
  // Rating States
  const [ratingTargetId, setRatingTargetId] = useState<number | null>(null);
  const [ratingScore, setRatingScore] = useState<number>(0);
  const [ratingComment, setRatingComment] = useState<string>("");
  const [hoveredScore, setHoveredScore] = useState<number | null>(null);

  const fetchRatings = async () => {
    try {
      if (!room.cycleBarterId) return;
      const res = await api.get(`/api/ratings/cycle-barter/${room.cycleBarterId}`);
      setRatings(res.data);
    } catch (err) {
      console.error("Failed to fetch cycle ratings:", err);
    }
  };

  useEffect(() => {
    if (isFullyVerified) {
      fetchRatings();
    }
  }, [isFullyVerified, room.cycleBarterId]);

  const handleUploadId = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    setError(null);
    try {
      const url = await uploadToCloudinary(file);
      setUploadedIdUrl(url);
    } catch (err: any) {
      setError("Failed to upload ID image.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSign = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await api.post(`/api/cycle-negotiation/sign-agreement/${room.cycleBarterId}`);
      onRefresh();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to sign agreement.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompleteExchange = async () => {
    const idUrl = uploadedIdUrl || myUploadedId;
    if (!idUrl) {
      setError("Please upload your ID before completing.");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      await api.post(`/api/cycle-negotiation/submit-id/${room.cycleBarterId}`, {
        idCardUrl: idUrl,
      });
      setUploadedIdUrl(null);
      onRefresh();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to submit ID verification.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitRating = async (e: React.FormEvent) => {
    e.preventDefault();
    if (ratingScore < 1 || ratingScore > 5 || !ratingTargetId) {
      setError("Please select a rating score between 1 and 5 and select a user.");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      await api.post("/api/ratings", {
        cycleBarterId: room.cycleBarterId,
        toUserId: ratingTargetId,
        score: ratingScore,
        comment: ratingComment,
      });
      setRatingScore(0);
      setRatingComment("");
      setRatingTargetId(null);
      await fetchRatings();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to submit rating.");
    } finally {
      setIsLoading(false);
    }
  };

  const partners = [
    { id: req.initiator.id, name: req.initiator.name, role: "Initiator" },
    { id: req.middleman.id, name: req.middleman.name, role: "Middleman" },
    { id: req.closer.id, name: req.closer.name, role: "Closer" }
  ].filter(p => p.id !== currentUser?.id);

  const getMyRatingFor = (userId: number) => {
    return ratings.find(r => r.fromUserId === currentUser?.id && r.ratingId && (
       // Wait, the API doesn't return toUserId in RatingResponseDto for published ratings?
       // Let's assume we can't easily map it if not present, but for now we just show submitted.
       // Actually we need to make sure we don't rate twice.
       true // We will just check if we have rated them below using a simpler check if possible
    )); // We will fix this by checking count.
  };

  const myRatingsCount = ratings.filter(r => r.fromUserId === currentUser?.id).length;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 shadow-sm rounded-2xl overflow-hidden flex flex-col mt-6">
      <div className="bg-slate-50 dark:bg-slate-950/80 border-b border-slate-100 dark:border-slate-800 px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <FileSignature size={18} className="text-indigo-600" />
          <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm tracking-tight">
            {isFullyVerified
              ? "Completed Cycle Exchange"
              : isFullySigned
                ? "Verify Physical Exchange"
                : "Sign 3-Way Digital Agreement"}
          </h3>
        </div>
        {isFullyVerified ? (
          <span className="bg-emerald-100 text-emerald-700 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md flex items-center gap-1.5 shadow-sm border border-emerald-200/50">
            <Lock size={10} strokeWidth={3} /> Sealed & Completed
          </span>
        ) : isFullySigned ? (
          <span className="bg-indigo-100 text-indigo-700 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md flex items-center gap-1.5 shadow-sm border border-indigo-200/50">
            <Clock size={10} strokeWidth={3} /> Verification Pending
          </span>
        ) : (
          <span className="bg-amber-100 text-amber-700 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md flex items-center gap-1.5 shadow-sm border border-amber-200/50">
            Pending Signatures
          </span>
        )}
      </div>

      <div className="p-5 space-y-5">
        {error && (
          <div className="bg-red-50 border border-red-100 text-red-600 p-3.5 rounded-xl text-xs font-semibold flex items-start gap-2">
            <AlertTriangle size={16} className="shrink-0 mt-0.5" />
            {error}
          </div>
        )}

        <div className="bg-slate-50 dark:bg-slate-950/50 rounded-xl p-4 border border-slate-100 dark:border-slate-800 shadow-inner">
          <p className="text-[13px] text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
            By signing this document, all three parties agree to the cyclic exchange of the specified items. Once all parties sign and verify IDs, a legally binding digital hash is generated.
          </p>
        </div>

        {/* 1. Signatures Pending View */}
        {!isFullySigned && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl p-4">
              <div className="flex flex-col gap-1">
                <span className="text-slate-600 dark:text-slate-400 font-semibold text-xs">{req.initiator.name}</span>
                {room.userASigned ? (
                  <span className="flex items-center gap-1.5 text-emerald-600 font-bold text-xs"><CheckCircle2 size={16} /> Signed</span>
                ) : (
                  <span className="flex items-center gap-1.5 text-amber-500 font-bold text-xs"><Clock size={16} /> Pending</span>
                )}
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-slate-600 dark:text-slate-400 font-semibold text-xs">{req.middleman.name}</span>
                {room.userBSigned ? (
                  <span className="flex items-center gap-1.5 text-emerald-600 font-bold text-xs"><CheckCircle2 size={16} /> Signed</span>
                ) : (
                  <span className="flex items-center gap-1.5 text-amber-500 font-bold text-xs"><Clock size={16} /> Pending</span>
                )}
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-slate-600 dark:text-slate-400 font-semibold text-xs">{req.closer.name}</span>
                {room.userCSigned ? (
                  <span className="flex items-center gap-1.5 text-emerald-600 font-bold text-xs"><CheckCircle2 size={16} /> Signed</span>
                ) : (
                  <span className="flex items-center gap-1.5 text-amber-500 font-bold text-xs"><Clock size={16} /> Pending</span>
                )}
              </div>
            </div>

            <div className="pt-2 flex items-center gap-3">
              {!mySignStatus ? (
                <button
                  onClick={handleSign}
                  disabled={isLoading}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl text-sm transition-all shadow-sm disabled:opacity-50"
                >
                  {isLoading ? "Signing..." : "Sign Agreement"}
                </button>
              ) : (
                <button disabled className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-400 font-bold py-3 rounded-xl text-sm cursor-not-allowed border border-slate-200 dark:border-slate-800">
                  Waiting for Partners...
                </button>
              )}
            </div>
          </div>
        )}

        {/* 2. Verify Exchange View */}
        {isFullySigned && !isFullyVerified && (
          <div className="space-y-4">
            <div className="bg-indigo-50/40 dark:bg-indigo-950/20 border border-dashed border-indigo-200 dark:border-indigo-800/80 rounded-2xl p-5 flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <span className="text-xs font-black text-indigo-900 dark:text-indigo-400 uppercase tracking-widest flex items-center gap-2">
                  <Camera size={16} /> ID Verification
                </span>
                <span className="text-xs text-slate-650 dark:text-slate-400 leading-relaxed font-medium">
                  All swappers must upload a clear photo of their physical ID card to conclude the cycle exchange.
                </span>
              </div>

              {!myUploadedId ? (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <input type="file" ref={fileInputRef} onChange={handleUploadId} accept="image/*" className="hidden" />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading || isLoading}
                      className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-800 hover:border-indigo-500 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors shadow-sm disabled:opacity-50"
                    >
                      {isUploading ? "Uploading ID..." : "Upload Your ID"}
                    </button>
                    {uploadedIdUrl && <span className="text-xs text-emerald-600 font-bold flex items-center gap-1"><CheckCircle2 size={14} /> Ready</span>}
                  </div>
                  {uploadedIdUrl && (
                    <div className="relative size-20 rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm mt-1">
                      <img src={uploadedIdUrl} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-[12px] text-emerald-600 dark:text-emerald-400 flex flex-col gap-2 mt-0.5 bg-emerald-50/50 dark:bg-emerald-950/20 px-3.5 py-3 rounded-xl border border-emerald-100 dark:border-emerald-900/60">
                  <span className="font-bold flex items-center gap-1.5"><CheckCircle2 size={16} /> You have uploaded your ID</span>
                </div>
              )}

              <div className="mt-2 text-xs font-medium text-slate-600 dark:text-slate-400 flex flex-col gap-2">
                <span className="font-semibold">Upload Status:</span>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                   <div className="flex items-center gap-1">
                     <span className="text-xs">{req.initiator.name}:</span>
                     {room.userAIdCardUrl ? <CheckCircle2 size={14} className="text-emerald-500" /> : <Clock size={14} className="text-amber-500" />}
                   </div>
                   <div className="flex items-center gap-1">
                     <span className="text-xs">{req.middleman.name}:</span>
                     {room.userBIdCardUrl ? <CheckCircle2 size={14} className="text-emerald-500" /> : <Clock size={14} className="text-amber-500" />}
                   </div>
                   <div className="flex items-center gap-1">
                     <span className="text-xs">{req.closer.name}:</span>
                     {room.userCIdCardUrl ? <CheckCircle2 size={14} className="text-emerald-500" /> : <Clock size={14} className="text-amber-500" />}
                   </div>
                </div>
              </div>
            </div>

            {!myUploadedId && (
              <div className="pt-2 flex items-center gap-3">
                <button
                  onClick={handleCompleteExchange}
                  disabled={isLoading || isUploading || !uploadedIdUrl}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl text-sm transition-all shadow-sm disabled:opacity-50"
                >
                  {isLoading ? "Submitting..." : "Submit ID"}
                </button>
              </div>
            )}

            {room.documentHash && (
              <div className="p-4 bg-slate-950 rounded-xl text-white shadow-md mt-4">
                <div className="flex items-center gap-2 mb-1.5">
                  <ShieldCheck size={16} className="text-emerald-400" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-300">
                    Partial Trade Receipt & Verification Key
                  </span>
                </div>
                <p className="text-[11px] font-mono text-slate-400 break-all select-all leading-relaxed mb-2.5">
                  {room.documentHash}
                </p>
                <p className="text-[10px] text-slate-400 leading-normal font-medium">
                  Copy and save this unique key. Submit this verification key to the system administrator in case of disputes.
                </p>
              </div>
            )}
          </div>
        )}

        {/* 3. Fully Verified View */}
        {isFullyVerified && (
          <div className="space-y-4">
            <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-950 p-4 rounded-xl text-emerald-800 dark:text-emerald-400 text-xs font-bold leading-relaxed shadow-sm">
              The cycle exchange has been completed and finalized fully! All swappers verified IDs.
            </div>

            {room.documentHash && (
              <div className="p-4 bg-slate-950 rounded-xl text-white shadow-md">
                <div className="flex items-center gap-2 mb-1.5">
                  <ShieldCheck size={16} className="text-emerald-400" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-300">
                    Trade Receipt & Verification Key
                  </span>
                </div>
                <p className="text-[11px] font-mono text-slate-400 break-all select-all leading-relaxed mb-2.5">
                  {room.documentHash}
                </p>
                <p className="text-[10px] text-slate-400 leading-normal font-medium">
                  Copy and save this unique key. Submit this verification key to the system administrator in case of disputes.
                </p>
              </div>
            )}

            <div className="border-t border-slate-100 dark:border-slate-800 pt-4">
              <button
                onClick={() => setIsReportModalOpen(true)}
                className="w-full flex items-center justify-center gap-2 text-red-650 dark:text-red-400 font-bold py-3 rounded-xl text-sm border border-red-100 dark:border-red-900/60 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all cursor-pointer"
              >
                <AlertTriangle size={16} />
                Report an Issue / Dispute Trade
              </button>
            </div>

            {/* 4. Rating Section for Cycle */}
            <div className="border-t border-slate-100 dark:border-slate-800 pt-5 mt-5 space-y-4">
              <div className="flex items-center gap-2">
                <Star size={18} className="text-amber-500 fill-amber-400" />
                <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                  Rate Your Cycle Partners
                </h4>
              </div>

              {myRatingsCount < 2 ? (
                <form onSubmit={handleSubmitRating} className="space-y-4">
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                    You can rate each of the other two participants in this cycle. ({2 - myRatingsCount} remaining)
                  </p>
                  
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-350">Select Partner</label>
                    <select
                      value={ratingTargetId || ""}
                      onChange={(e) => setRatingTargetId(Number(e.target.value))}
                      className="text-sm p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 text-slate-900 focus:ring-1 focus:ring-indigo-500 outline-none"
                    >
                      <option value="">-- Choose User --</option>
                      {partners.map(p => (
                        <option key={p.id} value={p.id}>{p.name} ({p.role})</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-350">Rating Score</label>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRatingScore(star)}
                          onMouseEnter={() => setHoveredScore(star)}
                          onMouseLeave={() => setHoveredScore(null)}
                          className="focus:outline-none transition-transform hover:scale-110 cursor-pointer"
                        >
                          <Star size={26} className={`${star <= (hoveredScore ?? ratingScore) ? "fill-amber-400 text-amber-500" : "text-slate-300 dark:text-slate-750"} transition-colors`} />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-350">Review Comments</label>
                    <textarea
                      value={ratingComment}
                      onChange={(e) => setRatingComment(e.target.value)}
                      placeholder="Share your experience (optional)..."
                      className="w-full min-h-[90px] text-sm p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 text-slate-900 focus:ring-1 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-400"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading || ratingScore === 0 || !ratingTargetId}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-xl text-xs transition-all shadow-sm disabled:opacity-50"
                  >
                    {isLoading ? "Saving..." : "Submit Feedback"}
                  </button>
                </form>
              ) : (
                <div className="bg-emerald-50 text-emerald-700 p-4 rounded-xl text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 size={16} /> You have rated all partners in this cycle.
                </div>
              )}

              {ratings.length > 0 && (
                <div className="mt-4 space-y-3">
                  <h5 className="text-xs font-bold text-slate-700">Cycle Ratings</h5>
                  {ratings.map(r => (
                    <div key={r.ratingId} className="bg-slate-50 dark:bg-slate-950/35 border border-slate-100 dark:border-slate-850 p-3 rounded-xl">
                       <div className="flex items-center justify-between">
                         <span className="text-xs font-bold text-slate-700">{r.fromUserName} rated a partner</span>
                         <div className="flex items-center gap-1">
                           {[1,2,3,4,5].map(s => <Star key={s} size={10} className={s <= r.score ? "fill-amber-400 text-amber-500" : "text-slate-200"} />)}
                         </div>
                       </div>
                       {r.comment && <p className="text-xs text-slate-500 mt-1 italic">"{r.comment}"</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {isReportModalOpen && (
        <ReportModal
          targetType="CYCLE_BARTER"
          targetId={room.cycleBarterId}
          onClose={() => setIsReportModalOpen(false)}
          onSuccess={() => alert("Report submitted successfully.")}
        />
      )}
    </div>
  );
}
