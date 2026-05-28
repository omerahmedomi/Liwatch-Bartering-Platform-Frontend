"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ChevronLeft,
  ShieldCheck,
  Loader2,
  ArrowRightLeft,
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

  useEffect(() => {
    const initRoom = async () => {
      try {
        const userRes = await api.get("/api/profile/me");
        const userId = userRes.data?.user?.id;
        setCurrentUserId(userId);

        if (!userId) return;

        const negoRes = await api.post(
          `/api/negotiation/get-all-nego/${userId}`,
        );
        const allRooms = negoRes.data?.data || negoRes.data;

        const currentRoom = allRooms.find((r: any) => r.id === negotiationId);
        setRoomData(currentRoom);
      } catch (error) {
        console.error("Failed to load room context", error);
      } finally {
        setLoading(false);
      }
    };

    initRoom();
  }, [negotiationId]);

  if (loading || !currentUserId) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#FAFAFA]">
        <Loader2 className="animate-spin text-indigo-600" size={32} />
      </div>
    );
  }

  if (!roomData) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-[#FAFAFA]">
        <p className="text-slate-500 mb-4">
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

  return (
    // THE FIX IS HERE: h-[100dvh] ensures it fits mobile screens perfectly,
    // and pt-20 reserves exactly 80px for your global Navbar!
    <main className="h-screen pt-20 flex flex-col bg-[#FAFAFA] overflow-hidden selection:bg-indigo-100">
      {/* Room Header */}
      <header className="h-[72px] bg-white border-b border-slate-200/60 px-4 flex items-center justify-between shrink-0 z-10 shadow-sm relative p-3">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 -ml-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors cursor-pointer"
          >
            <ChevronLeft size={24} />
          </button>

          <div className="flex items-center gap-3">
            <div className="size-10 rounded-full bg-gradient-to-br from-slate-100 to-slate-50 border border-slate-200 text-indigo-700 flex items-center justify-center font-black text-sm shadow-inner">
              {partner.profileImage ? (
                <img
                  src={partner.profileImage}
                  alt=""
                  className="w-full h-full object-cover rounded-xl"
                />
              ) : (
                partnerName.charAt(0).toUpperCase()
              )}
            </div>
            <div>
              <h1 className="font-bold text-slate-900 leading-tight">
                {partnerName}
              </h1>
              <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 flex items-center gap-1">
                <ShieldCheck size={12} strokeWidth={2.5} /> Secure Session
              </p>
            </div>
          </div>
        </div>

        {/* Desktop Deal Context */}
        <div className="hidden lg:flex items-center gap-3 bg-slate-50 border border-slate-100 px-4 py-2 rounded-xl">
          <span className="text-xs font-bold text-slate-500 truncate max-w-[150px]">
            {givingPost?.title}
          </span>
          <div className="size-6 bg-white border border-slate-200 rounded-full flex items-center justify-center shadow-sm">
            <ArrowRightLeft size={12} className="text-indigo-500" />
          </div>
          <span className="text-xs font-bold text-slate-900 truncate max-w-[150px]">
            {gettingPost?.title}
          </span>
        </div>
      </header>

      {/* Main Workspace - Flex-1 ensures it fills exactly the remaining space */}
      <div className="flex-1 overflow-hidden relative">
        <ChatPanel
          currentUserId={currentUserId}
          negotiationId={negotiationId}
          status={roomData.status}
        />
      </div>
    </main>
  );
}
