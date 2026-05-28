"use client";
import { useState } from "react";
import {
  ShieldCheck,
  FileSignature,
  CheckCircle2,
  Clock,
  XCircle,
  Lock,
  AlertTriangle,
} from "lucide-react";
import api from "@/lib/axios";

interface DigitalAgreementPanelProps {
  barterId: number;
  isUserA: boolean;
  agreement: {
    id?: number;
    status: string;
    type: string;
    userASigned: boolean;
    userBSigned: boolean;
    documentHash?: string;
    agreementTerms?: string;
  } | null;
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

  // Map boolean states based on who is currently logged in viewing the panel
  const hasISigned = isUserA ? agreement?.userASigned : agreement?.userBSigned;
  const hasPartnerSigned = isUserA
    ? agreement?.userBSigned
    : agreement?.userASigned;
  const isFullySigned = !!agreement?.documentHash;
  const isCanceled = agreement?.status === "CANCELED";

  const handleSign = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await api.post("/dga/sign_partial_agreement", {
        barterId: barterId,
        agreementType: "PARTIAL",
      });
      onRefresh(); // Trigger parent to fetch fresh data
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to sign agreement.");
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

  if (isCanceled) {
    return (
      <div className="bg-red-50 border border-red-100 rounded-2xl p-6 text-center shadow-sm">
        <XCircle className="mx-auto text-red-500 mb-3" size={28} />
        <h3 className="text-base font-bold text-red-900">Agreement Canceled</h3>
        <p className="text-sm text-red-700 mt-1">
          This digital agreement was rejected. The barter has been returned to
          negotiations.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200/80 shadow-sm rounded-2xl overflow-hidden flex flex-col">
      {/* Header */}
      <div className="bg-slate-50/80 border-b border-slate-100 px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <FileSignature size={18} className="text-indigo-600" />
          <h3 className="font-bold text-slate-900 text-sm tracking-tight">
            Digital Exchange Agreement
          </h3>
        </div>
        {isFullySigned && (
          <span className="bg-emerald-100 text-emerald-700 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md flex items-center gap-1.5 shadow-sm border border-emerald-200/50">
            <Lock size={10} strokeWidth={3} /> Sealed
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
        <div className="bg-slate-50/50 rounded-xl p-4 border border-slate-100 shadow-inner">
          <p className="text-[13px] text-slate-700 leading-relaxed font-medium">
            {agreement?.agreementTerms ||
              "By signing this document, both parties agree to the exchange of the specified items. Once both parties sign, a legally binding digital hash is generated in accordance with electronic signature laws."}
          </p>
        </div>

        {/* Dynamic Signature Trackers */}
        <div className="flex flex-col gap-3.5 bg-white border border-slate-100 rounded-xl p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-600 font-semibold tracking-tight">
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

          <div className="h-px w-full bg-slate-50" />

          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-600 font-semibold tracking-tight">
              Partner's Signature
            </span>
            {hasPartnerSigned ? (
              <span className="flex items-center gap-1.5 text-emerald-600 font-bold text-xs">
                <CheckCircle2 size={16} /> Signed
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-slate-400 font-bold text-xs">
                <Clock size={16} /> Waiting
              </span>
            )}
          </div>
        </div>

        {/* Cryptographic Hash Display (Only renders when both have signed) */}
        {isFullySigned && (
          <div className="mt-2 p-4 bg-slate-900 rounded-xl text-white shadow-md">
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck size={16} className="text-emerald-400" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-300">
                Tamper-Proof SHA-256 Hash
              </span>
            </div>
            <p className="text-[11px] font-mono text-slate-400 break-all select-all leading-relaxed">
              {agreement.documentHash}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        {!isFullySigned && (
          <div className="pt-2 flex items-center gap-3">
            {!hasISigned ? (
              <button
                onClick={handleSign}
                disabled={isLoading}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl text-sm transition-all shadow-sm disabled:opacity-50"
              >
                {isLoading ? "Signing..." : "Sign Agreement"}
              </button>
            ) : (
              <button
                disabled
                className="flex-1 bg-slate-100 text-slate-400 font-bold py-3 rounded-xl text-sm cursor-not-allowed border border-slate-200"
              >
                Waiting for Partner...
              </button>
            )}

            <button
              onClick={handleReject}
              disabled={isLoading}
              className="px-5 py-3 rounded-xl text-sm font-bold text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors disabled:opacity-50"
            >
              Reject
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
