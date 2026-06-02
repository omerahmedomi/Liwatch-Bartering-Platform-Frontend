"use client";
import { useState, useRef, useEffect } from "react";
import { X, Upload, CheckCircle2, AlertTriangle } from "lucide-react";
import api from "@/lib/axios";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { createPortal } from "react-dom";

interface ReportModalProps {
  targetType: "USER" | "POST" | "BARTER";
  targetId: number | string;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function ReportModal({ targetType, targetId, onClose, onSuccess }: ReportModalProps) {
  const [issueType, setIssueType] = useState<string>("");
  const [reason, setReason] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [evidenceUrl, setEvidenceUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Freeze scroll and handle hydration
  useEffect(() => {
    setMounted(true);
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, []);

  const handleUploadEvidence = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    setError(null);
    try {
      const url = await uploadToCloudinary(file);
      setEvidenceUrl(url);
    } catch (err: any) {
      setError("Failed to upload evidence image.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!issueType) {
      setError("Please select an issue type.");
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      await api.post("/api/reports", {
        targetType,
        targetId,
        issueType,
        reason,
        evidenceUrl,
      });
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to submit report.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!mounted) return null;

  return createPortal(
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Report Issue / Dispute</h2>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 p-3 rounded-xl text-sm font-semibold flex items-start gap-2">
              <AlertTriangle size={16} className="shrink-0 mt-0.5" />
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Issue Type <span className="text-red-500">*</span></label>
            <select
              value={issueType}
              onChange={(e) => setIssueType(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
              required
            >
              <option value="" disabled>Select issue type</option>
              <option value="SCAM">Scam / Fraud</option>
              <option value="INAPPROPRIATE_CONTENT">Inappropriate Content</option>
              <option value="HARASSMENT">Harassment</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Description</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Provide details about the issue..."
              rows={4}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Evidence (Optional)</label>
            <div className="flex items-center gap-3">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleUploadEvidence}
                accept="image/*"
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-500 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-300 transition-colors shadow-sm disabled:opacity-50"
              >
                {isUploading ? (
                  <>
                    <span className="inline-block size-3 border-2 border-slate-300 dark:border-slate-700 border-t-indigo-600 rounded-full animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload size={16} className="text-indigo-600" />
                    Upload Image
                  </>
                )}
              </button>
              {evidenceUrl && (
                <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                  <CheckCircle2 size={14} /> Uploaded
                </span>
              )}
            </div>
            {evidenceUrl && (
              <div className="mt-3 relative h-24 w-full rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
                <img src={evidenceUrl} alt="Evidence Preview" className="h-full object-contain" />
              </div>
            )}
          </div>

          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-sm transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isUploading || !issueType}
              className="flex-1 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm transition-colors shadow-sm disabled:opacity-50"
            >
              {isSubmitting ? "Submitting..." : "Submit Report"}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
