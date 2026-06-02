"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import {
  ChevronLeft,
  ShieldCheck,
  Loader2,
  ArrowRightLeft,
  FileSignature,
  X,
} from "lucide-react";
import api from "@/lib/axios";
import ChatPanel from "./ChatPanel";
import DigitalAgreementPanel from "./DigitalAgreementPanel";

export default function NegotiationRoom() {
  const params = useParams();
  const router = useRouter();
  const negotiationId = Number(params.id);

  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [roomData, setRoomData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isPartnerOnline, setIsPartnerOnline] = useState(false);
  const [isPartnerTyping, setIsPartnerTyping] = useState(false);

  // UI State for the Universal Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  // UI State for the Universal Modal
  const [isMounted, setIsMounted] = useState(false); // <-- ADD THIS

  // Set mounted to true immediately on load
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Fetch function for initializing and refreshing
 const fetchRoomData = async () => {
   try {
     let userId = currentUserId;
     if (!userId) {
       const userRes = await api.get("/api/profile/me");
       userId = userRes.data?.user?.id;
       setCurrentUserId(userId);
     }
     if (!userId) return;

     const negoRes = await api.post(`/api/negotiation/get-all-nego/${userId}`);
     const allRooms = negoRes.data?.data || negoRes.data;

     const currentRoom = allRooms.find((r: any) => r.id === negotiationId);

     // --- THE FIX ---
     // Ensure the roomData includes the agreement object we just enabled in the backend
     setRoomData({
       ...currentRoom,
       agreement: currentRoom.agreement, // This pulls the agreement object from the response
     });
     // ----------------
   } catch (error) {
     console.error("Failed to load room context", error);
   } finally {
     setLoading(false);
   }
 };

  useEffect(() => {
    fetchRoomData();
  }, [negotiationId]);

  if (loading || !currentUserId) {
    return (
      <div className="h-[100dvh] flex items-center justify-center bg-[#FAFAFA] dark:bg-slate-950">
        <Loader2 className="animate-spin text-indigo-600" size={32} />
      </div>
    );
  }

  if (!roomData) {
    return (
      <div className="h-[100dvh] flex flex-col items-center justify-center bg-[#FAFAFA] dark:bg-slate-950">
        <p className="text-slate-500 dark:text-slate-400 mb-4">
          Negotiation room not found or unauthorized.
        </p>
        <button
          onClick={() => router.back()}
          className="text-indigo-600 font-bold hover:underline cursor-pointer"
        >
          Go Back
        </button>
      </div>
    );
  }

  const isUserA = roomData.barter.userA.id === currentUserId;
  const partner = isUserA ? roomData.barter.userB : roomData.barter.userA;
  const givingPost = isUserA ? roomData.barter.postA : roomData.barter.postB;
  const gettingPost = isUserA ? roomData.barter.postB : roomData.barter.postA;
  const partnerName = partner.fullName || partner.name;

  // Evaluate if the negotiation has progressed far enough to show the Trust Center
  const showTrustCenter =
    ["PENDING", "ACTIVE", "CANCELED"].includes(roomData?.status) ||
    roomData?.agreement != null;

  return (
    <main className="h-[100dvh] pt-20 flex flex-col bg-[#FAFAFA] dark:bg-slate-950 overflow-hidden selection:bg-indigo-100">
      {/* Room Header */}
      <header className="h-[72px] bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800/60 px-4 flex items-center justify-between shrink-0 shadow-sm relative p-3 z-[1]">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 -ml-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors cursor-pointer"
          >
            <ChevronLeft size={24} />
          </button>

          <div className="flex items-center gap-3">
            <div className="relative shrink-0">
              <div className="relative size-10 rounded-full bg-gradient-to-br from-slate-100 to-slate-50 border border-slate-200 dark:border-slate-800 text-indigo-700 flex items-center justify-center font-black text-sm shadow-inner overflow-hidden shrink-0">
                {partner.profileImage ? (
                  <img
                    src={partner.profileImage}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  partnerName.charAt(0).toUpperCase()
                )}
              </div>
              {isPartnerOnline && (
                <span className="absolute bottom-0 right-0 size-3  bg-emerald-500 border-2 border-white rounded-full z-10000! animate-in fade-in zoom-in duration-200 " />
              )}
            </div>

            <div className="min-w-0">
              <h1 className="font-bold text-slate-900 dark:text-slate-100 leading-tight truncate">
                {partnerName}
              </h1>
              {isPartnerTyping ? (
                <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-600 animate-pulse">
                  typing...
                </p>
              ) : (
                <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 flex items-center gap-1">
                  <ShieldCheck size={12} strokeWidth={2.5} /> Secure Session
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Desktop Deal Context (Hides on very small mobile to make room for button) */}
        <div className="hidden md:flex items-center gap-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 px-4 py-2 rounded-xl mx-4">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 truncate max-w-[150px]">
            {givingPost?.title}
          </span>
          <div className="size-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full flex items-center justify-center shadow-sm shrink-0">
            <ArrowRightLeft size={12} className="text-indigo-500" />
          </div>
          <span className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate max-w-[150px]">
            {gettingPost?.title}
          </span>
        </div>

        {/* Universal Trust Center Button (Now shows on ALL screen sizes) */}
        {showTrustCenter && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-sm hover:shadow-md transition-all shrink-0 cursor-pointer"
          >
            <FileSignature size={14} />
            <span className="hidden sm:inline">Review Agreement</span>
            <span className="sm:hidden">Agreement</span>
          </button>
        )}
      </header>

      {/* AI Negotiation Guidance Banner */}
      {roomData && roomData.fairnessScore !== null && roomData.fairnessScore !== undefined && (
        <div className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800/60 px-6 py-3 shrink-0 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-1.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-750 dark:text-indigo-400 font-black uppercase tracking-wider text-[10px] px-2.5 py-1 rounded-md border border-indigo-100 dark:border-indigo-900/30">
              AI Advisor
            </span>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-500 dark:text-slate-400">Trade Fairness:</span>
              <div className="flex items-center gap-1.5 font-black text-slate-800 dark:text-slate-100">
                <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-extrabold ${
                  roomData.suggestionBadgeColor === "green" 
                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400" 
                    : roomData.suggestionBadgeColor === "red" 
                    ? "bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-450" 
                    : "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-405"
                }`}>
                  {roomData.suggestionBadge || "Slightly uneven"}
                </span>
                <span className={`text-sm ${
                  roomData.suggestionBadgeColor === "green" 
                    ? "text-emerald-600 dark:text-emerald-400" 
                    : roomData.suggestionBadgeColor === "red" 
                    ? "text-rose-600 dark:text-rose-450" 
                    : "text-amber-600 dark:text-amber-450"
                }`}>
                  {Math.round(roomData.fairnessScore)}%
                </span>
              </div>
            </div>
            {roomData.suggestionAdvice && (
              <span className="text-slate-650 dark:text-slate-300 font-medium">
                — {roomData.suggestionAdvice}
              </span>
            )}
          </div>
          <div className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold shrink-0">
            ⚠ AI suggestion may make mistakes. Verify independent values.
          </div>
        </div>
      )}

      {/* Main Workspace (Now exclusively the Chat Panel) */}
      <div className="flex-1 overflow-hidden relative">
        <ChatPanel
          currentUserId={currentUserId}
          negotiationId={negotiationId}
          status={roomData.status}
          onPartnerStatusChange={setIsPartnerOnline}
          onPartnerTypingChange={setIsPartnerTyping}
        />
      </div>

      {/* Universal Modal Overlay for Digital Agreement */}
      {/* Universal Modal Overlay using React Portals */}
      {/* Universal Modal Overlay using React Portals */}
      {isModalOpen &&
        isMounted &&
        createPortal(
          <div
            className="fixed inset-0 flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200"
            style={{
              zIndex: 999999,
            }} /* <-- THE BULLETPROOF FIX: Bypasses Tailwind completely */
          >
            {/* Dark Blurred Backdrop */}
            {/* Dark Blurred Backdrop */}
            <div
              className="absolute inset-0 backdrop-blur-md"
              style={{ backgroundColor: "rgba(15, 23, 42, 0.4)" }}
              onClick={() => setIsModalOpen(false)}
            />

            {/* Modal Container */}
            <div className="relative w-full max-w-[480px] max-h-[90vh] flex flex-col bg-[#FAFAFA] dark:bg-slate-950 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800/60 bg-white dark:bg-slate-900">
                <h2 className="text-xs font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 flex items-center gap-2">
                  <ShieldCheck size={16} className="text-indigo-600" />
                  Trust Center
                </h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-800 bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Modal Body (Scrollable) */}
              <div className="overflow-y-auto p-4 sm:p-5">
                <DigitalAgreementPanel
                  barterId={roomData.barter.id}
                  isUserA={isUserA}
                  agreement={roomData.agreement || null}
                  onRefresh={fetchRoomData}
                />
              </div>
            </div>
          </div>,
          document.body,
        )}
    </main>
  );
}
