"use client";
import { useEffect, useState } from "react";
import { Loader2, Inbox, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/axios";
import RequestCard from "@/components/request/RequestCard";

export default function RequestsPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
      
        
        const res = await api.get(`/api/direct-swap/my-requests`);
        console.log("Requests", res);
        setRequests( res?.data);
        
      } catch (error) {
        console.error("Failed to fetch requests", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

 
  const handleActionComplete = (requestId: number) => {
    setRequests((prev) => prev.filter((req) => req.id !== requestId));
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 pt-32 pb-20 flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-indigo-600" size={40} />
        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">
          Loading Inbox...
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 pt-28 pb-20 selection:bg-indigo-100 selection:text-indigo-900">
      <div className="max-w-3xl mx-auto px-6">
        {/* Page Header */}
        <div className="mb-10">
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-2 flex items-center gap-3">
            Trade Offers
            {requests.length > 0 && (
              <span className="bg-indigo-100 text-indigo-700 text-sm py-1 px-3 rounded-full">
                {requests.length} New
              </span>
            )}
          </h1>
          <p className="text-slate-500 font-medium">
            Review items other traders want to exchange with you.
          </p>
        </div>

     
        {requests.length > 0 ? (
          <div className="space-y-6">
            <AnimatePresence>
              {requests.map((request) => (
                <motion.div
                  key={request.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, height: 0, marginBottom: 0 }}
                  transition={{ duration: 0.3 }}
                >
               
                    <RequestCard
                    request={request}
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
            className="bg-white rounded-[2rem] p-12 text-center shadow-sm border border-slate-100 flex flex-col items-center justify-center mt-8"
          >
            <div className="size-24 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-6 border-8 border-white shadow-inner">
              <Inbox size={40} strokeWidth={1.5} />
            </div>
            <h2 className="text-2xl font-black text-slate-900 mb-2">
              You're all caught up!
            </h2>
            <p className="text-slate-500 font-medium max-w-sm mb-8">
              You don't have any pending trade offers right now. Keep posting
              great items to attract more traders.
            </p>
            <div className="flex items-center gap-2 text-emerald-600 font-bold bg-emerald-50 px-4 py-2 rounded-xl text-sm border border-emerald-100">
              <CheckCircle2 size={18} /> Inbox Zero
            </div>
          </motion.div>
        )}
      </div>
    </main>
  );
}
