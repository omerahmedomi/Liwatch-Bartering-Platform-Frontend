import React from "react";
import { ArrowRight, Check, X } from "lucide-react";
import api from "@/lib/axios";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function CycleRequestCard({ request, currentUserId, onActionComplete }: any) {
  const router = useRouter();

  const isInitiator = request.initiator.id === currentUserId;
  const isMiddleman = request.middleman.id === currentUserId;
  const isCloser = request.closer.id === currentUserId;

  const handleAccept = async () => {
    try {
      await api.post(`/api/cycle-swap/accept-request/${request.id}`);
      toast.success("Cycle Swap Accepted");
      onActionComplete(request.id, "cycle");
    } catch (err) {
      toast.error("Failed to accept");
    }
  };

  const handleDecline = async () => {
    try {
      await api.post(`/api/cycle-swap/decline-request/${request.id}`);
      toast.error("Cycle Swap Declined");
      onActionComplete(request.id, "cycle");
    } catch (err) {
      toast.error("Failed to decline");
    }
  };

  const handleCancel = async () => {
    try {
      await api.post(`/api/cycle-swap/cancel-request/${request.id}`);
      toast.error("Cycle Swap Canceled");
      onActionComplete(request.id, "cycle");
    } catch (err) {
      toast.error("Failed to cancel");
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border-2 border-emerald-500/30 shadow-sm mb-4">
      <div className="flex items-center gap-2 mb-4">
        <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
          3-Way Cycle Swap
        </span>
        <span className="text-sm text-slate-500 font-medium">Initiated by {request.initiator.name}</span>
      </div>

      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
        <div className="text-center w-full md:w-1/3">
          <p className="text-xs text-slate-400 font-bold mb-1">{request.initiator.name} gives</p>
          <p className="font-bold">{request.postA.title}</p>
        </div>
        <ArrowRight className="text-emerald-500 rotate-90 md:rotate-0" />
        <div className="text-center w-full md:w-1/3">
          <p className="text-xs text-slate-400 font-bold mb-1">{request.middleman.name} gives</p>
          <p className="font-bold">{request.postB.title}</p>
        </div>
        <ArrowRight className="text-emerald-500 rotate-90 md:rotate-0" />
        <div className="text-center w-full md:w-1/3">
          <p className="text-xs text-slate-400 font-bold mb-1">{request.closer.name} gives</p>
          <p className="font-bold">{request.postC.title}</p>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4 text-sm font-bold">
          <span className={request.middlemanAccepted ? "text-emerald-600" : "text-amber-500"}>
            {request.middleman.name}: {request.middlemanAccepted ? "Accepted" : "Pending"}
          </span>
          <span className={request.closerAccepted ? "text-emerald-600" : "text-amber-500"}>
            {request.closer.name}: {request.closerAccepted ? "Accepted" : "Pending"}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {isInitiator && (
            <button onClick={handleCancel} className="bg-red-50 text-red-600 px-4 py-2 rounded-xl font-bold hover:bg-red-100 transition-colors">
              Cancel
            </button>
          )}

          {(isMiddleman && !request.middlemanAccepted) || (isCloser && !request.closerAccepted) ? (
            <>
              <button onClick={handleDecline} className="bg-red-50 text-red-600 px-4 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-red-100 transition-colors">
                <X size={16} /> Decline
              </button>
              <button onClick={handleAccept} className="bg-emerald-600 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-emerald-700 transition-colors shadow-md shadow-emerald-500/20">
                <Check size={16} /> Accept
              </button>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
