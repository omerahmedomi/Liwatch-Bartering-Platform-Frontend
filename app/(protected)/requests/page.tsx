"use client";
import { useEffect, useState } from "react";
import { Loader2, Inbox, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/axios";
import RequestCard from "@/components/request/RequestCard";

import CycleRequestCard from "@/components/request/CycleRequestCard";

export default function RequestsPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [cycleRequests, setCycleRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [filter, setFilter] = useState<"RECEIVED" | "SENT">("RECEIVED");
  const [swapTypeFilter, setSwapTypeFilter] = useState<"ALL" | "NORMAL" | "CYCLE">("ALL");

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const userRes = await api.get("/api/profile/me");
        const userId = userRes.data?.user?.id;
        setCurrentUserId(userId);

        const [res, cycleRes] = await Promise.all([
          api.get(`/api/direct-swap/my-requests`),
          api.get(`/api/cycle-swap/my-requests`)
        ]);
        setRequests(res?.data || []);
        setCycleRequests(cycleRes?.data || []);
      } catch (error) {
        console.error("Failed to fetch requests", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  const handleActionComplete = (requestId: number, type: "direct" | "cycle" = "direct") => {
    if (type === "cycle") {
      setCycleRequests((prev) => prev.filter((req) => req.id !== requestId));
    } else {
      setRequests((prev) => prev.filter((req) => req.id !== requestId));
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-32 pb-20 flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-indigo-600" size={40} />
        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">
          Loading Inbox...
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-28 pb-20 selection:bg-indigo-100 selection:text-indigo-900">
      <div className="max-w-3xl mx-auto px-6">
        {/* Page Header */}
        <div className="mb-10">
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-slate-100 tracking-tight mb-2 flex items-center gap-3">
            Trade Offers
            {requests.length > 0 && (
              <span className="bg-indigo-100 text-indigo-700 text-sm py-1 px-3 rounded-full">
                {requests.length} New
              </span>
            )}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">
            Review items other traders want to exchange with you, and track the offers you've sent.
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex items-center gap-2 bg-slate-200/50 dark:bg-slate-800/50 p-1 rounded-xl w-fit">
            <button
              onClick={() => setFilter("RECEIVED")}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                filter === "RECEIVED"
                  ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm"
                  : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
              }`}
            >
              Offers Received
            </button>
            <button
              onClick={() => setFilter("SENT")}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                filter === "SENT"
                  ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm"
                  : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
              }`}
            >
              Offers Sent
            </button>
          </div>

          <div className="flex items-center gap-2 bg-slate-200/50 dark:bg-slate-800/50 p-1 rounded-xl w-fit">
            <button
              onClick={() => setSwapTypeFilter("ALL")}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                swapTypeFilter === "ALL"
                  ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm"
                  : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
              }`}
            >
              All Types
            </button>
            <button
              onClick={() => setSwapTypeFilter("NORMAL")}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                swapTypeFilter === "NORMAL"
                  ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm"
                  : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
              }`}
            >
              Normal
            </button>
            <button
              onClick={() => setSwapTypeFilter("CYCLE")}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                swapTypeFilter === "CYCLE"
                  ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm"
                  : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
              }`}
            >
              Cycle
            </button>
          </div>
        </div>
     
        {(() => {
          const filteredRequests = requests.filter(req => {
            if (filter === "RECEIVED") return req.requestReceiver?.id === currentUserId;
            if (filter === "SENT") return req.requestSender?.id === currentUserId;
            return true;
          });

          const filteredCycleRequests = cycleRequests.filter(req => {
            if (filter === "RECEIVED") return req.middleman?.id === currentUserId || req.closer?.id === currentUserId;
            if (filter === "SENT") return req.initiator?.id === currentUserId;
            return true;
          });

          const hasAnyRequests = filteredRequests.length > 0 || filteredCycleRequests.length > 0;

          return hasAnyRequests ? (
            <div className="space-y-6">
              <AnimatePresence>
                {swapTypeFilter !== "NORMAL" && filteredCycleRequests.map((request) => (
                  <motion.div
                    key={`cycle-${request.id}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, height: 0, marginBottom: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <CycleRequestCard
                      request={request}
                      currentUserId={currentUserId}
                      onActionComplete={handleActionComplete}
                    />
                  </motion.div>
                ))}

                {swapTypeFilter !== "CYCLE" && filteredRequests.map((request) => (
                  <motion.div
                    key={`direct-${request.id}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, height: 0, marginBottom: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <RequestCard
                      request={request}
                      currentUserId={currentUserId}
                      onActionComplete={handleActionComplete}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ) : (
           
            //if not requests
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white dark:bg-slate-900 rounded-[2rem] p-12 text-center shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center mt-8"
            >
              <div className="size-24 bg-slate-50 dark:bg-slate-950 rounded-full flex items-center justify-center text-slate-300 mb-6 border-8 border-white shadow-inner">
                <Inbox size={40} strokeWidth={1.5} />
              </div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100 mb-2">
                {filter === "RECEIVED" ? "No offers received yet!" : "No offers sent yet!"}
              </h2>
              <p className="text-slate-500 dark:text-slate-400 font-medium max-w-sm mb-8">
                {filter === "RECEIVED"
                  ? "You don't have any pending trade offers right now. Keep posting great items to attract more traders."
                  : "You haven't sent any pending trade offers right now. Browse listings and initiate trades!"}
              </p>
              <div className="flex items-center gap-2 text-emerald-600 font-bold bg-emerald-50 px-4 py-2 rounded-xl text-sm border border-emerald-100">
                <CheckCircle2 size={18} /> Inbox Zero
              </div>
            </motion.div>
          );
        })()}
      </div>
    </main>
  );
}
