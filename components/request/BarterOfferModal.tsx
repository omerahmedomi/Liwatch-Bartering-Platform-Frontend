"use client";
import { useState, useEffect, use } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, PackageSearch, Zap } from "lucide-react";
import InventoryTab from "./InverntoryTab";
import QuickOfferTab from "./QuickOfferTab";
import { createPortal } from "react-dom";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  wantedPostId: number;
  wantedPostTitle: string;
  userContextPromise:Promise<any>;
  requestedUser:any;
};

export default function BarterOfferModal({
  isOpen,
  onClose,
  wantedPostId,
  wantedPostTitle,
  userContextPromise,
  requestedUser
}: Props) {
  const [activeTab, setActiveTab] = useState<"inventory" | "quick">(
    "inventory",
  );

  const { userProfile } = use(userContextPromise);
  const currentUser = userProfile?.user;


  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 sm:p-6">
          {/*backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0  bg-slate-900/40 backdrop-blur-md"
          />

        
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="relative w-full max-w-2xl bg-white rounded-[2rem] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden border border-slate-100 "
          >
            {/* Header */}
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h2 className="text-xl font-black text-slate-900">
                  Propose a Trade
                </h2>
                <p className="text-sm font-medium text-slate-500 truncate max-w-sm">
                  For:{" "}
                  <span className="text-indigo-600 font-bold">
                    {wantedPostTitle}
                  </span>
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-slate-700 bg-white hover:bg-slate-100 rounded-full transition-colors border border-slate-200"
              >
                <X size={20} />
              </button>
            </div>

            {/* tabs */}
            <div className="flex p-2 bg-slate-100/50 border-b border-slate-100">
              <button
                onClick={() => setActiveTab("inventory")}
                className={`flex-1 py-3 text-sm font-black uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 ${
                  activeTab === "inventory"
                    ? "bg-white text-indigo-600 shadow-sm border border-slate-200/50"
                    : "text-slate-400 hover:text-slate-600"
                }`}
              >
                <PackageSearch size={16} /> My Inventory
              </button>
              <button
                onClick={() => setActiveTab("quick")}
                className={`flex-1 py-3 text-sm font-black uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 ${
                  activeTab === "quick"
                    ? "bg-white text-emerald-600 shadow-sm border border-slate-200/50"
                    : "text-slate-400 hover:text-slate-600"
                }`}
              >
                <Zap size={16} /> Quick Offer
              </button>
            </div>

            
            <div className="flex-1 overflow-y-auto bg-slate-50">
              {activeTab === "inventory" ? (
                <InventoryTab
                  wantedPostId={wantedPostId}
                  onSuccess={onClose}
                  user={currentUser}
                  requestedUser={requestedUser}
                />
              ) : (
                <QuickOfferTab
                  wantedPostId={wantedPostId}
                  onSuccess={onClose}
                />
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,document.body
  );
}
