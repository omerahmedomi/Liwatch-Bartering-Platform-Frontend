"use client";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Loader2 } from "lucide-react";

type Props = {
  isOpen: boolean;
  title: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
};

export default function DeleteConfirm({
  isOpen,
  title,
  onConfirm,
  onCancel,
  isLoading,
}: Props) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          {/* 1. The Backdrop Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
          />

          {/* 2. The Confirmation Card */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-sm bg-white rounded-[2.5rem] p-8 shadow-2xl border border-slate-100"
          >
            <div className="flex flex-col items-center text-center">
              <div className="size-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-6 ring-8 ring-red-50/50">
                <AlertTriangle size={32} />
              </div>

              <h3 className="text-xl font-black text-slate-900 mb-2">
                Delete Listing?
              </h3>
              <p className="text-slate-500 text-sm font-medium mb-8">
                Are you sure you want to delete{" "}
                <span className="font-bold text-slate-700">"{title}"</span>?
                This action cannot be undone.
              </p>

              <div className="grid grid-cols-2 gap-3 w-full">
                <button
                  disabled={isLoading}
                  onClick={onCancel}
                  className="py-4 px-6 rounded-2xl bg-slate-100 text-slate-600 font-bold hover:bg-slate-200 transition-all cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  disabled={isLoading}
                  onClick={onConfirm}
                  className="py-4 px-6 rounded-2xl bg-red-500 text-white font-black shadow-lg shadow-red-500/30 hover:bg-red-600 transition-all active:scale-95 cursor-pointer disabled:opacity-50 flex items-center justify-center"
                >
                  {isLoading ? (
                    <Loader2 className="animate-spin" size={20} />
                  ) : (
                    "Delete"
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
