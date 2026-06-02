"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  ShieldCheck, 
  Search, 
  FileText, 
  Users, 
  Layers, 
  AlertTriangle, 
  Image as ImageIcon,
  CheckCircle,
  XCircle,
  ExternalLink,
  ArrowRight
} from "lucide-react";
import api from "@/lib/axios";

interface VerifiedAgreement {
  agreementId: number;
  documentHash: string;
  agreementTerms: string;
  type: string;
  status: string;
  userASigned: boolean;
  userBSigned: boolean;
  uploadedIdByA?: string;
  uploadedIdByB?: string;
  createdAt: string;
  updatedAt: string;
  
  // Barter Info
  barterId?: number;
  userAId?: number;
  userAName?: string;
  userAEmail?: string;
  userBId?: number;
  userBName?: string;
  userBEmail?: string;
  postAId?: number;
  postATitle?: string;
  postBId?: number;
  postBTitle?: string;
}

export default function VerifyAgreementPage() {
  const [hashInput, setHashInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<VerifiedAgreement | null>(null);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hashInput.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await api.get(`/api/admin/barters/agreement-by-hash/${hashInput.trim()}`);
      setResult(res.data?.data);
    } catch (err: any) {
      console.error(err);
      setError(
        err.response?.data?.message || 
        "Verification failed. No agreement record matches the provided cryptographic key."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-3">
          <ShieldCheck size={32} className="text-indigo-500" />
          Agreement Authenticator
        </h1>
        <p className="text-slate-650 dark:text-slate-400 mt-1">
          Verify the integrity and authenticity of platform exchanges by scanning or entering their cryptographic hashes.
        </p>
      </div>

      {/* Input Console */}
      <form onSubmit={handleVerify} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="space-y-2">
          <label className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Cryptographic Receipt Hash (SHA-256)
          </label>
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Enter 64-character SHA-256 agreement verification key..."
                value={hashInput}
                onChange={(e) => setHashInput(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-3.5 pl-12 pr-4 text-sm font-mono tracking-tight text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !hashInput.trim()}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 rounded-xl text-sm transition-all shadow-sm flex items-center gap-2 disabled:opacity-55 cursor-pointer"
            >
              {loading ? "Verifying..." : "Verify Authenticity"}
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-650 dark:text-red-400 p-4 rounded-xl text-xs font-semibold flex items-start gap-2.5">
            <AlertTriangle className="shrink-0 mt-0.5" size={16} />
            {error}
          </div>
        )}
      </form>

      {/* Verification Result Display */}
      {result && (
        <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-300">
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-5 flex items-center gap-3">
            <CheckCircle className="text-emerald-500 shrink-0" size={24} />
            <div>
              <h4 className="text-sm font-bold text-emerald-950 dark:text-emerald-400">Cryptographic Seal Verified</h4>
              <p className="text-xs text-emerald-800 dark:text-emerald-500/90 mt-0.5">
                The hash key matches an authentic, signed trade agreement on the Smart Bartering Platform.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Column 1: Details & Lifecycle */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4 shadow-sm">
              <h3 className="text-sm font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-850 pb-2">
                Agreement Info
              </h3>
              
              <div className="space-y-3.5 text-xs">
                <div>
                  <span className="block font-semibold text-slate-400">Status</span>
                  <span className={`inline-block font-bold mt-1 px-2.5 py-0.5 rounded text-[10px] uppercase tracking-widest ${
                    result.status === "ACTIVE" 
                      ? "bg-indigo-500/10 text-indigo-400" 
                      : "bg-slate-500/10 text-slate-400"
                  }`}>
                    {result.status}
                  </span>
                </div>

                <div>
                  <span className="block font-semibold text-slate-400">Agreement Type</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{result.type}</span>
                </div>

                <div>
                  <span className="block font-semibold text-slate-400">Created At</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {new Date(result.createdAt).toLocaleString()}
                  </span>
                </div>

                <div>
                  <span className="block font-semibold text-slate-400">Finalized At</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {new Date(result.updatedAt).toLocaleString()}
                  </span>
                </div>

                <div>
                  <span className="block font-semibold text-slate-400">Barter ID</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    #{result.barterId}
                  </span>
                </div>
              </div>
            </div>

            {/* Column 2: Parties Involved */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4 shadow-sm">
              <h3 className="text-sm font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-850 pb-2 flex items-center gap-2">
                <Users size={16} className="text-slate-400" />
                Involved Parties
              </h3>

              <div className="space-y-4 text-xs">
                <div className="space-y-1 bg-slate-50 dark:bg-slate-950/40 p-3 rounded-xl border border-slate-100 dark:border-slate-850">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-800 dark:text-slate-200">{result.userAName}</span>
                    <span className="text-[10px] font-black text-slate-400">PARTY A</span>
                  </div>
                  <span className="block text-slate-500 font-medium">{result.userAEmail}</span>
                  <span className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-500 mt-2">
                    <CheckCircle size={12} /> Signed Digitally
                  </span>
                </div>

                <div className="space-y-1 bg-slate-50 dark:bg-slate-950/40 p-3 rounded-xl border border-slate-100 dark:border-slate-850">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-800 dark:text-slate-200">{result.userBName}</span>
                    <span className="text-[10px] font-black text-slate-400">PARTY B</span>
                  </div>
                  <span className="block text-slate-500 font-medium">{result.userBEmail}</span>
                  <span className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-500 mt-2">
                    <CheckCircle size={12} /> Signed Digitally
                  </span>
                </div>
              </div>
            </div>

            {/* Column 3: Listings Details */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4 shadow-sm">
              <h3 className="text-sm font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-850 pb-2 flex items-center gap-2">
                <Layers size={16} className="text-slate-400" />
                Listings Exchanged
              </h3>

              <div className="space-y-4 text-xs">
                <div className="space-y-1 bg-slate-50 dark:bg-slate-950/40 p-3 rounded-xl border border-slate-100 dark:border-slate-850">
                  <span className="text-[10px] font-black text-indigo-400 tracking-wider block">PARTY A GIVES:</span>
                  <Link href={`/post/${result.postAId}`} className="font-bold text-slate-800 dark:text-slate-200 hover:underline">
                    {result.postATitle}
                  </Link>
                </div>

                <div className="space-y-1 bg-slate-50 dark:bg-slate-950/40 p-3 rounded-xl border border-slate-100 dark:border-slate-850">
                  <span className="text-[10px] font-black text-indigo-400 tracking-wider block">PARTY B GIVES:</span>
                  <Link href={`/post/${result.postBId}`} className="font-bold text-slate-800 dark:text-slate-200 hover:underline">
                    {result.postBTitle}
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Full Agreement Terms Block */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-850 pb-2 flex items-center gap-2">
              <FileText size={16} className="text-slate-400" />
              Legally Sealed Agreement Terms
            </h3>
            <div className="bg-slate-50 dark:bg-slate-950/40 p-4 border border-slate-150 dark:border-slate-850 rounded-xl max-h-72 overflow-y-auto">
              <pre className="text-xs font-medium text-slate-750 dark:text-slate-300 font-mono whitespace-pre-wrap leading-relaxed">
                {result.agreementTerms}
              </pre>
            </div>
          </div>

          {/* Physical Exchange ID Upload Proofs */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-850 pb-2 flex items-center gap-2">
              <ImageIcon size={16} className="text-slate-400" />
              Physical Exchange Verification Uploads
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div className="space-y-2 bg-slate-50 dark:bg-slate-950/40 p-4 rounded-xl border border-slate-100 dark:border-slate-850">
                <span className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2">
                  User A's Upload (Partner B's ID)
                </span>
                {result.uploadedIdByA ? (
                  <div className="space-y-3">
                    <div className="h-48 w-full rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden shadow-inner bg-slate-200">
                      <img src={result.uploadedIdByA} alt="User A ID Upload" className="w-full h-full object-cover" />
                    </div>
                    <a href={result.uploadedIdByA} target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-500 font-bold hover:underline inline-flex items-center gap-1.5">
                      Open High Resolution Link <ExternalLink size={12} />
                    </a>
                  </div>
                ) : (
                  <div className="h-32 w-full rounded-lg border border-dashed border-slate-200 dark:border-slate-800 flex items-center justify-center text-xs text-slate-400">
                    ID Document Not Uploaded
                  </div>
                )}
              </div>

              <div className="space-y-2 bg-slate-50 dark:bg-slate-950/40 p-4 rounded-xl border border-slate-100 dark:border-slate-850">
                <span className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2">
                  User B's Upload (Partner A's ID)
                </span>
                {result.uploadedIdByB ? (
                  <div className="space-y-3">
                    <div className="h-48 w-full rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden shadow-inner bg-slate-200">
                      <img src={result.uploadedIdByB} alt="User B ID Upload" className="w-full h-full object-cover" />
                    </div>
                    <a href={result.uploadedIdByB} target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-500 font-bold hover:underline inline-flex items-center gap-1.5">
                      Open High Resolution Link <ExternalLink size={12} />
                    </a>
                  </div>
                ) : (
                  <div className="h-32 w-full rounded-lg border border-dashed border-slate-200 dark:border-slate-800 flex items-center justify-center text-xs text-slate-400">
                    ID Document Not Uploaded
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
