"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Loader2,
  MessageSquare,
  Sparkles,
  Clock,
  Search,
  Filter,
  ArrowRightLeft,
} from "lucide-react";
import api from "@/lib/axios";

// ... (Keep your existing TypeScript Interfaces here exactly as they were) ...
interface ChatDto {
  id: number;
  negotiationId: number;
  senderId: number;
  messageText: string;
  isEncrypted: boolean;
  isRead?: boolean;
  read?: boolean;
  sentAt: string;
}
interface UserDto {
  id: number;
  name: string;
  fullName?: string;
  profileImage?: string;
}
interface PostSimpleDto {
  postId: number;
  title: string;
}
interface BarterResponseDto {
  id: number;
  userA: UserDto;
  userB: UserDto;
  postA: PostSimpleDto;
  postB: PostSimpleDto;
}
interface DigitalAgreementDto {
  barterId: number;
  agreementType: "PARTIAL" | "FINALIZED";
  status: string;
  userASigned: boolean;
  userBSigned: boolean;
  documentHash?: string;
  agreementTerms?: string;
  uploadedIdByA?: string;
  uploadedIdByB?: string;
  id?: number;
}

interface NegotiationResponseDto {
  id: number;
  fairnessScore: number;
  status: any;
  barter: BarterResponseDto;
  messages: ChatDto[];
  agreement?: DigitalAgreementDto;
}

export default function MessagesInbox() {
  const [negotiations, setNegotiations] = useState<NegotiationResponseDto[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [swapTypeFilter, setSwapTypeFilter] = useState("ALL");

  useEffect(() => {
    const fetchInbox = async () => {
      try {
        const userRes = await api.get("/api/profile/me");
        const userId = userRes.data?.user?.id;
        setCurrentUserId(userId);
        if (!userId) return;

        const [res, cycleRes] = await Promise.all([
          api.post(`/api/negotiation/get-all-nego/${userId}`),
          api.get(`/api/cycle-negotiation/my-negotiations`)
        ]);

        let fetchedRooms: any[] = res.data?.data || res.data || [];
        let fetchedCycleRooms: any[] = cycleRes.data || [];

        const mixedRooms = [
          ...fetchedRooms.map(r => ({ ...r, type: "DIRECT" })),
          ...fetchedCycleRooms.map(r => ({ ...r, type: "CYCLE" }))
        ];

        mixedRooms.sort((a, b) => {
          const timeA = a.messages?.length
            ? new Date(a.messages[a.messages.length - 1].sentAt).getTime()
            : 0;
          const timeB = b.messages?.length
            ? new Date(b.messages[b.messages.length - 1].sentAt).getTime()
            : 0;
          return timeB - timeA;
        });

        setNegotiations(mixedRooms);
      } catch (error) {
        console.error("Failed to load inbox", error);
        setNegotiations([]);
      } finally {
        setLoading(false);
      }
    };
    fetchInbox();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen  flex items-center justify-center bg-[#FAFAFA] dark:bg-slate-950">
        <div className="relative flex items-center justify-center">
          <div className="absolute inset-0 bg-indigo-500/20 blur-xl rounded-full" />
          <Loader2
            className="animate-spin text-indigo-600 relative z-10"
            size={32}
          />
        </div>
      </div>
    );
  }

  const filteredNegotiations = negotiations.filter((room) => {
    const isCycle = room.type === "CYCLE";
    
    let partnerName = "";
    let givingPost = null;
    let gettingPost = null;

    if (isCycle) {
      const req = room.requestDetails;
      const isInitiator = req.initiator.id === currentUserId;
      const isMiddleman = req.middleman.id === currentUserId;
      
      if (isInitiator) {
        partnerName = `Cycle (with ${req.middleman.name} & ${req.closer.name})`;
        givingPost = req.postA;
        gettingPost = req.postB;
      } else if (isMiddleman) {
        partnerName = `Cycle (with ${req.initiator.name} & ${req.closer.name})`;
        givingPost = req.postB;
        gettingPost = req.postC;
      } else {
        partnerName = `Cycle (with ${req.initiator.name} & ${req.middleman.name})`;
        givingPost = req.postC;
        gettingPost = req.postA;
      }
    } else {
      const isUserA = room.barter.userA.id === currentUserId;
      const partner = isUserA ? room.barter.userB : room.barter.userA;
      partnerName = partner.fullName || partner.name;
      givingPost = isUserA ? room.barter.postA : room.barter.postB;
      gettingPost = isUserA ? room.barter.postB : room.barter.postA;
    }

    // Search filter
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = 
      partnerName?.toLowerCase().includes(searchLower) ||
      givingPost?.title?.toLowerCase().includes(searchLower) ||
      gettingPost?.title?.toLowerCase().includes(searchLower);

    // Status filter
    let matchesStatus = true;
    if (filterStatus !== "ALL") {
      const isCompleted = room.agreement?.status === "ACTIVE" && room.agreement?.agreementType === "FINALIZED";
      const isSealed = room.agreement?.status === "ACTIVE" && room.agreement?.agreementType !== "FINALIZED";
      const isCanceled = room.agreement?.status === "CANCELED" || room.status === "CANCELED";
      const isAgreed = room.status === "AGREED";
      const isPending = room.agreement?.status === "PENDING";
      const isNegotiating = !isCompleted && !isSealed && !isCanceled && !isAgreed && !isPending;

      switch(filterStatus) {
        case "COMPLETED": matchesStatus = isCompleted || isSealed; break;
        case "CANCELED": matchesStatus = isCanceled; break;
        case "AGREED": matchesStatus = isAgreed; break;
        case "PENDING": matchesStatus = isPending; break;
        case "NEGOTIATING": matchesStatus = isNegotiating; break;
      }
    }

    // Type filter
    let matchesType = true;
    if (swapTypeFilter === "NORMAL") matchesType = room.type === "DIRECT";
    if (swapTypeFilter === "CYCLE") matchesType = room.type === "CYCLE";

    return matchesSearch && matchesStatus && matchesType;
  });

  return (
    <main className="min-h-screen bg-[#FAFAFA] dark:bg-slate-950 pt-24 pb-16 px-4 sm:px-6 selection:bg-indigo-100 selection:text-indigo-900">
      <div className="max-w-4xl mx-auto">
        {/* Architected Header */}
        <header className="mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-slate-100 tracking-tight mb-2">
              Negotiations
            </h1>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <span className="relative flex size-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full size-2 bg-emerald-500"></span>
              </span>
              {filteredNegotiations.length} Active Trades
            </p>
          </div>
        </header>

        {/* Search and Filters */}
        <div className="mb-6 flex flex-col gap-3">
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
              Normal Swaps
            </button>
            <button
              onClick={() => setSwapTypeFilter("CYCLE")}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                swapTypeFilter === "CYCLE"
                  ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm"
                  : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
              }`}
            >
              Cycle Swaps
            </button>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Search by user or item..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-slate-900 dark:text-slate-100"
              />
            </div>
            <div className="relative min-w-[160px]">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <select 
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-8 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all appearance-none cursor-pointer text-slate-900 dark:text-slate-100"
              >
                <option value="ALL">All Statuses</option>
                <option value="NEGOTIATING">Negotiating</option>
                <option value="AGREED">Agreed</option>
                <option value="PENDING">Pending Agreement</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELED">Canceled</option>
              </select>
            </div>
          </div>
        </div>

        {filteredNegotiations.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950/50 p-16 flex flex-col items-center justify-center text-center backdrop-blur-sm">
            <div className="size-16 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 flex items-center justify-center text-slate-400 mb-6 rotate-3">
              <MessageSquare size={28} strokeWidth={1.5} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight mb-2">
              Inbox is empty
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm">
              Your active bartering sessions will securely appear here once a
              trade is initiated.
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredNegotiations.map((room) => {
              const isCycle = room.type === "CYCLE";
              let partnerName = "";
              let partnerImage = "";
              let givingPost = null;
              let gettingPost = null;

              if (isCycle) {
                const req = room.requestDetails;
                const isInitiator = req.initiator.id === currentUserId;
                const isMiddleman = req.middleman.id === currentUserId;
                
                if (isInitiator) {
                  partnerName = `Cycle (with ${req.middleman.name} & ${req.closer.name})`;
                  givingPost = req.postA;
                  gettingPost = req.postB;
                } else if (isMiddleman) {
                  partnerName = `Cycle (with ${req.initiator.name} & ${req.closer.name})`;
                  givingPost = req.postB;
                  gettingPost = req.postC;
                } else {
                  partnerName = `Cycle (with ${req.initiator.name} & ${req.middleman.name})`;
                  givingPost = req.postC;
                  gettingPost = req.postA;
                }
              } else {
                const isUserA = room.barter.userA.id === currentUserId;
                const partner = isUserA ? room.barter.userB : room.barter.userA;
                partnerName = partner.fullName || partner.name;
                partnerImage = partner.profileImage;
                givingPost = isUserA ? room.barter.postA : room.barter.postB;
                gettingPost = isUserA ? room.barter.postB : room.barter.postA;
              }

              const hasMessages = room.messages?.length > 0;
              const latestMsg = hasMessages
                ? room.messages[room.messages.length - 1]
                : null;

              const isUnread = !!(latestMsg && latestMsg.senderId !== currentUserId && !latestMsg.isRead && !latestMsg.read);

              return (
                <Link
                  href={isCycle ? `/cycle-messages/${room.id}` : `/messages/${room.id}`}
                  key={isCycle ? `cycle-${room.id}` : `direct-${room.id}`}
                  className={`group relative bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border transition-all duration-300 ease-out hover:-translate-y-0.5 flex flex-col sm:flex-row gap-5 ${
                    isUnread
                      ? "border-indigo-300/80 dark:border-indigo-800/80 shadow-md shadow-indigo-50/10 dark:shadow-none"
                      : "border-slate-200 dark:border-slate-800/60 shadow-sm hover:shadow-md hover:border-indigo-200/60"
                  }`}
                >
                  {/* Unread indicator vertical bar */}
                  {isUnread && (
                    <div className="absolute left-0 top-0 bottom-0 w-1.5 rounded-l-2xl bg-indigo-600 dark:bg-indigo-500 animate-pulse" />
                  )}
                  {/* Left Column: Avatar & Online Status */}
                  <div className="relative shrink-0 hidden sm:block">
                    <div className="size-14 rounded-full bg-gradient-to-br from-slate-100 to-slate-50 border border-slate-200 dark:border-slate-800 flex items-center justify-center overflow-hidden shadow-inner group-hover:scale-105 transition-transform duration-300">
                      {partnerImage ? (
                        <img
                          src={partnerImage}
                          alt={partnerName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-lg font-black text-slate-400 uppercase">
                          {partnerName.charAt(0)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Center Column: Trade Context & Message */}
                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                    {/* The Trade Context (The UX Upgrade) */}
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 px-2.5 py-1 rounded-lg">
                        <span className="truncate max-w-[100px] sm:max-w-[150px]">
                          {givingPost?.title}
                        </span>
                        <ArrowRightLeft
                          size={12}
                          className="text-slate-300 shrink-0"
                        />
                        <span className="text-slate-700 dark:text-slate-300 truncate max-w-[100px] sm:max-w-[150px]">
                          {gettingPost?.title}
                        </span>
                      </div>

                      {/* Dynamic Status Badge */}
                      <span
                        className={`shrink-0 text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md border ${
                          room.agreement?.status === "PENDING"
                            ? "bg-amber-50 text-amber-600 border-amber-100"
                            : room.agreement?.status === "ACTIVE" && room.agreement?.agreementType === "FINALIZED"
                              ? "bg-emerald-50 text-emerald-600 border-emerald-100 animate-pulse"
                              : room.agreement?.status === "ACTIVE"
                                ? "bg-indigo-50 text-indigo-600 border-indigo-100"
                                : room.status === "CANCELED" || room.agreement?.status === "CANCELED"
                                  ? "bg-rose-50 text-rose-600 border-rose-100"
                                  : room.status === "AGREED"
                                    ? "bg-blue-50 text-blue-600 border-blue-100"
                                    : "bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-800"
                        }`}
                      >
                        {room.agreement?.status === "PENDING"
                          ? "Pending"
                          : room.agreement?.status === "ACTIVE" && room.agreement?.agreementType === "FINALIZED"
                            ? "Completed"
                            : room.agreement?.status === "ACTIVE"
                              ? "Sealed"
                              : room.agreement?.status === "CANCELED" || room.status === "CANCELED"
                                ? "Canceled"
                                : room.status === "AGREED"
                                  ? "Agreed"
                                  : "Negotiating"}
                      </span>
                    </div>

                    {/* Partner Name & Message Snippet */}
                    <div className="flex items-baseline justify-between gap-4 mb-1">
                      <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 tracking-tight truncate group-hover:text-indigo-600 transition-colors flex items-center gap-2">
                        {partnerName}
                        {isUnread && (
                          <span className="size-2 rounded-full bg-indigo-600 dark:bg-indigo-500 shrink-0" />
                        )}
                      </h3>

                      {/* Timestamp pinned to right on mobile */}
                      {latestMsg && (
                        <span className="text-[11px] font-semibold text-slate-400 shrink-0 flex items-center gap-1">
                          <Clock size={10} />
                          {new Date(latestMsg.sentAt).toLocaleDateString(
                            undefined,
                            { month: "short", day: "numeric" },
                          )}
                        </span>
                      )}
                    </div>

                    <div className="text-sm truncate pr-4">
                      {hasMessages && latestMsg ? (
                        <p
                          className={`truncate ${isUnread ? "text-slate-900 dark:text-slate-100 font-semibold" : "text-slate-500 dark:text-slate-400 font-medium"}`}
                        >
                          <span className="text-slate-400 font-normal mr-1">
                            {latestMsg.senderId === currentUserId ? "You:" : ""}
                          </span>
                          {latestMsg.messageText}
                        </p>
                      ) : (
                        <p className="text-indigo-500 font-semibold flex items-center gap-1.5 text-sm">
                          <Sparkles size={14} /> Tap to begin negotiation
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
