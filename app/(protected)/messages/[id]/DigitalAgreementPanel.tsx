"use client";
import { useState, useRef, useEffect } from "react";
import {
  ShieldCheck,
  FileSignature,
  CheckCircle2,
  Clock,
  XCircle,
  Lock,
  AlertTriangle,
  Upload,
  Camera,
  Star,
} from "lucide-react";
import api from "@/lib/axios";
import { uploadToCloudinary } from "@/lib/cloudinary";
import ReportModal from "@/components/ReportModal";

interface DigitalAgreementPanelProps {
  barterId: number;
  isUserA: boolean;
  agreement: any;
  onRefresh: () => void;
}

export default function DigitalAgreementPanel({
  barterId,
  isUserA,
  agreement,
  onRefresh,
}: DigitalAgreementPanelProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedIdUrl, setUploadedIdUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Rating and review states (UC07)
  const [ratingWindow, setRatingWindow] = useState<any>(null);
  const [ratingScore, setRatingScore] = useState<number>(0);
  const [ratingComment, setRatingComment] = useState<string>("");
  const [isEditingRating, setIsEditingRating] = useState<boolean>(false);
  const [hoveredScore, setHoveredScore] = useState<number | null>(null);

  const fetchRatingWindow = async () => {
    try {
      const res = await api.get(`/api/ratings/barter/${barterId}/window`);
      setRatingWindow(res.data);
      if (res.data?.myScore) {
        setRatingScore(res.data.myScore);
        setRatingComment(res.data.myComment || "");
      }
    } catch (err) {
      console.error("Failed to fetch rating window status:", err);
    }
  };

  useEffect(() => {
    fetchRatingWindow();
  }, [barterId, agreement]);

  // Signatures Status (UC05)
  const hasISigned = isUserA
    ? agreement?.userASigned === true
    : agreement?.userBSigned === true;
  const hasPartnerSigned = isUserA
    ? agreement?.userBSigned === true
    : agreement?.userASigned === true;

  // ID Uploads Status (UC06)
  const myUploadedId = isUserA ? agreement?.uploadedIdByA : agreement?.uploadedIdByB;
  const partnerUploadedId = isUserA ? agreement?.uploadedIdByB : agreement?.uploadedIdByA;

  // Lifecycle States
  const isCanceled = agreement?.status === "CANCELED";
  const isExchangeCompleted = agreement?.agreementType === "FINALIZED";
  const isPartialSigned = agreement?.status === "ACTIVE" && agreement?.agreementType === "PARTIAL";
  const isPendingSignature = !agreement?.userASigned || !agreement?.userBSigned;

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

  // UC05 Signature Submission
  const handleSign = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await api.post("/dga/sign_partial_agreement", {
        barterId: barterId,
        agreementType: "PARTIAL",
      });
      onRefresh(); // Trigger parent refresh
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to sign agreement.");
    } finally {
      setIsLoading(false);
    }
  };

  // UC06 ID Upload / Exchange Completion Submission
  const handleCompleteExchange = async () => {
    const idUrl = uploadedIdUrl || myUploadedId;
    if (!idUrl) {
      setError("Please upload the ID of the other partner before completing.");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      await api.post("/dga/sign_final_agreement", {
        agreementID: agreement.id,
        idCardImageOfSwapper: idUrl,
      });
      setUploadedIdUrl(null);
      onRefresh(); // Trigger parent refresh
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to submit ID verification.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReject = async () => {
    if (
      !confirm(
        "Are you sure you want to reject this agreement? It will cancel the trade.",
      )
    )
      return;
    setIsLoading(true);
    try {
      await api.post(`/dga/reject_agreement/${barterId}`);
      onRefresh();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to reject agreement.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelExchange = async () => {
    if (
      !confirm(
        "Are you sure you want to cancel this exchange agreement? This will end the barter and open a rating window.",
      )
    )
      return;
    setIsLoading(true);
    setError(null);
    try {
      await api.post(`/dga/cancel_agreement/${agreement.id}`);
      onRefresh();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to cancel agreement.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitRating = async (e: React.FormEvent) => {
    e.preventDefault();
    if (ratingScore < 1 || ratingScore > 5) {
      setError("Please select a rating score between 1 and 5.");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      await api.post("/api/ratings", {
        barterId: barterId,
        score: ratingScore,
        comment: ratingComment,
      });
      await fetchRatingWindow();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to submit rating.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateRating = async (e: React.FormEvent) => {
    e.preventDefault();
    if (ratingScore < 1 || ratingScore > 5) {
      setError("Please select a rating score between 1 and 5.");
      return;
    }
    if (!ratingWindow?.myRatingId) return;
    setIsLoading(true);
    setError(null);
    try {
      await api.put(`/api/ratings/${ratingWindow.myRatingId}`, {
        score: ratingScore,
        comment: ratingComment,
      });
      setIsEditingRating(false);
      await fetchRatingWindow();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update rating.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditingRating(false);
    if (ratingWindow?.myScore) {
      setRatingScore(ratingWindow.myScore);
      setRatingComment(ratingWindow.myComment || "");
    }
  };

  if (isCanceled && (!ratingWindow || !ratingWindow.status)) {
    return (
      <div className="bg-rose-50 border border-rose-100 rounded-2xl p-6 text-center shadow-sm">
        <XCircle className="mx-auto text-rose-500 mb-3" size={28} />
        <h3 className="text-base font-bold text-rose-900">Agreement Canceled</h3>
        <p className="text-sm text-rose-700 mt-1">
          This digital agreement was rejected. The barter has been returned to negotiations.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 shadow-sm rounded-2xl overflow-hidden flex flex-col">
      {/* Header */}
      <div className="bg-slate-50 dark:bg-slate-950/80 border-b border-slate-100 dark:border-slate-800 px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <FileSignature size={18} className="text-indigo-600" />
          <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm tracking-tight">
            {isExchangeCompleted
              ? "Completed Exchange Agreement"
              : isPartialSigned
                ? "Complete Physical Exchange"
                : isCanceled
                  ? "Canceled Exchange Agreement"
                  : "Sign Digital Agreement"}
          </h3>
        </div>
        {isExchangeCompleted ? (
          <span className="bg-emerald-100 text-emerald-700 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md flex items-center gap-1.5 shadow-sm border border-emerald-200/50">
            <Lock size={10} strokeWidth={3} /> Sealed & Completed
          </span>
        ) : isPartialSigned ? (
          <span className="bg-indigo-100 text-indigo-700 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md flex items-center gap-1.5 shadow-sm border border-indigo-200/50">
            <Clock size={10} strokeWidth={3} /> Partial Signed
          </span>
        ) : isCanceled ? (
          <span className="bg-rose-100 text-rose-700 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md flex items-center gap-1.5 shadow-sm border border-rose-200/50">
            <XCircle size={10} strokeWidth={3} /> Canceled
          </span>
        ) : (
          <span className="bg-amber-100 text-amber-700 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md flex items-center gap-1.5 shadow-sm border border-amber-200/50">
            Pending Signature
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

        {/* The Terms Box */}
        {!isCanceled && (
          <div className="bg-slate-50 dark:bg-slate-950/50 rounded-xl p-4 border border-slate-100 dark:border-slate-800 shadow-inner">
            <p className="text-[13px] text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
              {agreement?.agreementTerms ||
                "By signing this document, both parties agree to the exchange of the specified items. Once both parties sign, a legally binding digital hash is generated in accordance with electronic signature laws."}
            </p>
          </div>
        )}

        {isCanceled && (
          <div className="bg-rose-50/40 dark:bg-rose-950/10 border border-rose-100/50 dark:border-rose-900/40 rounded-xl p-5 text-center shadow-sm">
            <XCircle className="mx-auto text-rose-500 mb-3" size={28} />
            <h4 className="text-base font-bold text-rose-900 dark:text-rose-300">Exchange Agreement Canceled</h4>
            <p className="text-xs text-rose-755 dark:text-rose-400 mt-1 leading-relaxed max-w-md mx-auto">
              This exchange agreement was cancelled. The barter has been closed and the rating window is now open for both swappers to leave feedback.
            </p>
          </div>
        )}

        {/* 1. Signatures Pending View */}
        {isPendingSignature && (
          <div className="space-y-4">
            <div className="flex flex-col gap-3.5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600 dark:text-slate-400 font-semibold tracking-tight">
                  Your Signature
                </span>
                {hasISigned ? (
                  <span className="flex items-center gap-1.5 text-emerald-600 font-bold text-xs">
                    <CheckCircle2 size={16} /> Signed
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-amber-500 font-bold text-xs">
                    <Clock size={16} /> Pending
                  </span>
                )}
              </div>

              <div className="h-px w-full bg-slate-100 dark:bg-slate-800" />

              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600 dark:text-slate-400 font-semibold tracking-tight">
                  Partner's Signature
                </span>
                {hasPartnerSigned ? (
                  <span className="flex items-center gap-1.5 text-emerald-600 font-bold text-xs">
                    <CheckCircle2 size={16} /> Signed
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-amber-500 font-bold text-xs">
                    <Clock size={16} /> Waiting for Signature
                  </span>
                )}
              </div>
            </div>

            <div className="pt-2 flex items-center gap-3">
              {!hasISigned ? (
                <button
                  onClick={handleSign}
                  disabled={isLoading}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl text-sm transition-all shadow-sm disabled:opacity-50 cursor-pointer"
                >
                  {isLoading ? "Signing..." : "Sign Agreement"}
                </button>
              ) : (
                <button
                  disabled
                  className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-400 font-bold py-3 rounded-xl text-sm cursor-not-allowed border border-slate-200 dark:border-slate-800"
                >
                  Waiting for Partner...
                </button>
              )}

              <button
                onClick={handleReject}
                disabled={isLoading}
                className="px-5 py-3 rounded-xl text-sm font-bold text-red-600 hover:bg-rose-50 hover:text-red-750 transition-colors disabled:opacity-50 cursor-pointer"
              >
                Reject
              </button>
            </div>
          </div>
        )}

        {/* 2. Complete Physical Exchange (In-Person ID Upload) View */}
        {isPartialSigned && (
          <div className="space-y-4">
            <div className="bg-indigo-50/40 dark:bg-indigo-950/20 border border-dashed border-indigo-200 dark:border-indigo-800/80 rounded-2xl p-5 flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <span className="text-xs font-black text-indigo-900 dark:text-indigo-400 uppercase tracking-widest flex items-center gap-2">
                  <Camera size={16} /> Partner's ID Verification
                </span>
                <span className="text-xs text-slate-650 dark:text-slate-400 leading-relaxed font-medium">
                  Both swappers must meet in person and upload a clear photo of the partner's physical ID card (front and back) to conclude the exchange.
                </span>
              </div>

              {/* Upload controls (Only show if current user hasn't uploaded yet) */}
              {!myUploadedId ? (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleUploadId}
                      accept="image/*"
                      className="hidden"
                      id="partner-id-upload"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading || isLoading}
                      className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-800 hover:border-indigo-500 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
                    >
                      {isUploading ? (
                        <>
                          <span className="inline-block size-3 border-2 border-slate-300 border-t-indigo-600 rounded-full animate-spin" />
                          Uploading ID...
                        </>
                      ) : (
                        <>
                          <Upload size={14} className="text-indigo-600" />
                          Take Photo / Upload Partner's ID
                        </>
                      )}
                    </button>
                    {uploadedIdUrl && (
                      <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                        <CheckCircle2 size={14} /> ID Ready
                      </span>
                    )}
                  </div>
                  {uploadedIdUrl && (
                    <div className="relative size-20 rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm mt-1">
                      <img src={uploadedIdUrl} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-[12px] text-emerald-600 dark:text-emerald-400 flex flex-col gap-2 mt-0.5 bg-emerald-50/50 dark:bg-emerald-950/20 px-3.5 py-3 rounded-xl border border-emerald-100 dark:border-emerald-900/60">
                  <span className="font-bold flex items-center gap-1.5">
                    <CheckCircle2 size={16} /> You have uploaded partner's ID
                  </span>
                  <a href={myUploadedId} target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline">
                    View Uploaded Document
                  </a>
                </div>
              )}

              {/* Partner's upload status */}
              <div className="mt-2 text-xs font-medium text-slate-600 dark:text-slate-400 flex items-center gap-2">
                <span className="font-semibold">Partner Upload Status:</span>
                {partnerUploadedId ? (
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 size={14} /> ID Uploaded
                  </span>
                ) : (
                  <span className="text-amber-500 font-bold flex items-center gap-1">
                    <Clock size={14} /> Pending Partner Upload
                  </span>
                )}
              </div>
            </div>

            {/* Complete Exchange Action Button */}
            {!myUploadedId && (
              <div className="pt-2 flex items-center gap-3">
                <button
                  onClick={handleCompleteExchange}
                  disabled={isLoading || isUploading || !uploadedIdUrl}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl text-sm transition-all shadow-sm disabled:opacity-50 cursor-pointer"
                >
                  {isLoading ? "Submitting..." : "Submit ID & Verify Exchange"}
                </button>
                <button
                  onClick={handleCancelExchange}
                  disabled={isLoading}
                  className="px-5 py-3 rounded-xl text-sm font-bold text-red-650 hover:bg-rose-50 hover:text-red-700 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  Cancel Exchange
                </button>
              </div>
            )}

            {myUploadedId && !partnerUploadedId && (
              <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-4 text-center text-xs text-slate-500 font-medium leading-relaxed">
                Waiting for the other partner to upload your ID card image to fully finalize the exchange.
              </div>
            )}
          </div>
        )}

        {/* 3. Exchange Completed Successfully View */}
        {isExchangeCompleted && (
          <div className="space-y-4">
            <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-950 p-4 rounded-xl text-emerald-800 dark:text-emerald-400 text-xs font-bold leading-relaxed shadow-sm">
              The exchange has been completed and finalized fully! Both swappers verified IDs and physical exchange matches descriptions.
            </div>

            {/* Audit Trail ID Links */}
            <div className="grid grid-cols-2 gap-3.5 bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-850 p-4 rounded-xl text-xs">
              <div className="flex flex-col gap-1">
                <span className="font-semibold text-slate-500 dark:text-slate-400">Your verification upload:</span>
                {myUploadedId ? (
                  <a href={myUploadedId} target="_blank" rel="noopener noreferrer" className="text-indigo-650 dark:text-indigo-400 font-bold hover:underline">
                    View ID Image
                  </a>
                ) : (
                  <span className="text-slate-400">N/A</span>
                )}
              </div>
              <div className="flex flex-col gap-1">
                <span className="font-semibold text-slate-500 dark:text-slate-400">Partner's verification upload:</span>
                {partnerUploadedId ? (
                  <a href={partnerUploadedId} target="_blank" rel="noopener noreferrer" className="text-indigo-650 dark:text-indigo-400 font-bold hover:underline">
                    View ID Image
                  </a>
                ) : (
                  <span className="text-slate-400">N/A</span>
                )}
              </div>
            </div>

            {/* Cryptographic Hash Display */}
            {agreement?.documentHash && (
              <div className="p-4 bg-slate-950 rounded-xl text-white shadow-md">
                <div className="flex items-center gap-2 mb-1.5">
                  <ShieldCheck size={16} className="text-emerald-400" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-300">
                    Trade Receipt & Verification Key
                  </span>
                </div>
                <p className="text-[11px] font-mono text-slate-400 break-all select-all leading-relaxed mb-2.5">
                  {agreement.documentHash}
                </p>
                <p className="text-[10px] text-slate-400 leading-normal font-medium">
                  Copy and save this unique key. In case of any dispute, issue, or to prove the authenticity of your transaction, you can submit this verification key to the system administrator.
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
          </div>
        )}

        {/* 4. Rate & Review Section */}
        {ratingWindow && ratingWindow.status && (
          <div className="border-t border-slate-100 dark:border-slate-800 pt-5 mt-5 space-y-4">
            <div className="flex items-center gap-2">
              <Star size={18} className="text-amber-500 fill-amber-400" />
              <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                {ratingWindow.status === "Open"
                  ? ratingWindow.userSubmitted && !isEditingRating
                    ? "Your Submitted Feedback"
                    : "Rate & Review Your Swapper"
                  : "Exchange Feedback Summary"}
              </h4>
            </div>

            {ratingWindow.status === "Open" ? (
              // Open Window State
              !ratingWindow.userSubmitted || isEditingRating ? (
                // Submit or Edit Form
                <form onSubmit={isEditingRating ? handleUpdateRating : handleSubmitRating} className="space-y-4">
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                    {isEditingRating
                      ? "You can update your rating score and comments. Once saved, it remains blind until both submit or the window closes."
                      : "Please rate your experience with your partner. To prevent retaliatory ratings, reviews remain hidden until both parties have submitted or the 7-day deadline passes."}
                  </p>

                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-350">
                      Rating Score
                    </label>
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
                          <Star
                            size={26}
                            className={`${
                              star <= (hoveredScore ?? ratingScore)
                                ? "fill-amber-400 text-amber-500"
                                : "text-slate-300 dark:text-slate-750"
                            } transition-colors`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-350">
                      Review Comments
                    </label>
                    <textarea
                      value={ratingComment}
                      onChange={(e) => setRatingComment(e.target.value)}
                      placeholder="Share your experience (optional)..."
                      className="w-full min-h-[90px] text-sm p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/55 dark:bg-slate-950/20 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-400 text-slate-800 dark:text-slate-200"
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="submit"
                      disabled={isLoading || ratingScore === 0}
                      className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-xl text-xs transition-all shadow-sm disabled:opacity-50 cursor-pointer"
                    >
                      {isLoading ? "Saving..." : isEditingRating ? "Save Changes" : "Submit Feedback"}
                    </button>
                    {isEditingRating && (
                      <button
                        type="button"
                        onClick={handleCancelEdit}
                        disabled={isLoading}
                        className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </form>
              ) : (
                // Submitted view, but window still open (allowing edit)
                <div className="space-y-4">
                  <div className="bg-indigo-50/30 dark:bg-indigo-950/10 border border-indigo-150/50 dark:border-indigo-900/40 rounded-xl p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            size={16}
                            className={
                              star <= ratingScore
                                ? "fill-amber-400 text-amber-500"
                                : "text-slate-200 dark:text-slate-800"
                            }
                          />
                        ))}
                      </div>
                      <span className="text-[10px] text-indigo-650 dark:text-indigo-400 font-bold uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950/50 px-2 py-0.5 rounded-md">
                        Pending Publication
                      </span>
                    </div>
                    {ratingComment ? (
                      <p className="text-xs text-slate-700 dark:text-slate-350 italic leading-relaxed">
                        "{ratingComment}"
                      </p>
                    ) : (
                      <p className="text-xs text-slate-400 italic">No review comment provided.</p>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
                    <span>
                      {ratingWindow.otherUserSubmitted
                        ? "Partner has submitted feedback."
                        : "Waiting for partner's feedback."}
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsEditingRating(true)}
                      className="text-indigo-650 dark:text-indigo-455 font-bold hover:underline"
                    >
                      Edit Review
                    </button>
                  </div>
                </div>
              )
            ) : (
              // Published or Expired State (Show both user's and partner's feedback)
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Your Review */}
                <div className="bg-slate-50 dark:bg-slate-950/35 border border-slate-100 dark:border-slate-850 p-4 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Your feedback
                    </span>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          size={12}
                          className={
                            ratingWindow.myScore && star <= ratingWindow.myScore
                              ? "fill-amber-400 text-amber-500"
                              : "text-slate-200 dark:text-slate-800"
                          }
                        />
                      ))}
                    </div>
                  </div>
                  {ratingWindow.myComment ? (
                    <p className="text-xs text-slate-650 dark:text-slate-350 italic leading-relaxed">
                      "{ratingWindow.myComment}"
                    </p>
                  ) : (
                    <p className="text-xs text-slate-400 italic">No review left.</p>
                  )}
                </div>

                {/* Partner's Review */}
                <div className="bg-slate-50 dark:bg-slate-950/35 border border-slate-100 dark:border-slate-850 p-4 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Partner's feedback
                    </span>
                    {ratingWindow.partnerScore ? (
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            size={12}
                            className={
                              star <= ratingWindow.partnerScore
                                ? "fill-amber-400 text-amber-500"
                                : "text-slate-200 dark:text-slate-800"
                            }
                          />
                        ))}
                      </div>
                    ) : (
                      <span className="text-[10px] text-slate-400 font-bold uppercase">
                        Not Submitted
                      </span>
                    )}
                  </div>
                  {ratingWindow.partnerScore ? (
                    ratingWindow.partnerComment ? (
                      <p className="text-xs text-slate-655 dark:text-slate-350 italic leading-relaxed">
                        "{ratingWindow.partnerComment}"
                      </p>
                    ) : (
                      <p className="text-xs text-slate-400 italic">No comment left.</p>
                    )
                  ) : (
                    <p className="text-xs text-slate-400 italic">
                      Partner did not submit a rating within the deadline.
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {isReportModalOpen && (
        <ReportModal
          targetType="BARTER"
          targetId={barterId}
          onClose={() => setIsReportModalOpen(false)}
          onSuccess={() => {
            alert("Report submitted successfully.");
          }}
        />
      )}
    </div>
  );
}
