"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Loader2,
  MessageSquare,
  ArrowRightLeft,
  Sparkles,
  Clock,
} from "lucide-react";
import api from "@/lib/axios";

// ... (Keep your existing TypeScript Interfaces here exactly as they were) ...
interface ChatDto {
  id: number;
  negotiationId: number;
  senderId: number;
  messageText: string;
  isEncrypted: boolean;
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
interface NegotiationResponseDto {
  id: number;
  fairnessScore: number;
  status: string;
  barter: BarterResponseDto;
  messages: ChatDto[];
}

export default function MessagesInbox() {
  const [negotiations, setNegotiations] = useState<NegotiationResponseDto[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  useEffect(() => {
    const fetchInbox = async () => {
      try {
        const userRes = await api.get("/api/profile/me");
        const userId = userRes.data?.user?.id;
        setCurrentUserId(userId);
        if (!userId) return;

        const res = await api.post(`/api/negotiation/get-all-nego/${userId}`);
        let fetchedRooms: NegotiationResponseDto[] = res.data?.data || res.data;

        if (!Array.isArray(fetchedRooms)) return setNegotiations([]);

        fetchedRooms.sort((a, b) => {
          const timeA = a.messages?.length
            ? new Date(a.messages[a.messages.length - 1].sentAt).getTime()
            : 0;
          const timeB = b.messages?.length
            ? new Date(b.messages[b.messages.length - 1].sentAt).getTime()
            : 0;
          return timeB - timeA;
        });

        setNegotiations(fetchedRooms);
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
      <div className="min-h-screen  flex items-center justify-center bg-[#FAFAFA]">
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

  return (
    <main className="min-h-screen bg-[#FAFAFA] pt-24 pb-16 px-4 sm:px-6 selection:bg-indigo-100 selection:text-indigo-900">
      <div className="max-w-4xl mx-auto">
        {/* Architected Header */}
        <header className="mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mb-2">
              Negotiations
            </h1>
            <p className="text-sm font-medium text-slate-500 flex items-center gap-2">
              <span className="relative flex size-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full size-2 bg-emerald-500"></span>
              </span>
              {negotiations.length} Active Trades
            </p>
          </div>
        </header>

        {negotiations.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50/50 p-16 flex flex-col items-center justify-center text-center backdrop-blur-sm">
            <div className="size-16 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center text-slate-400 mb-6 rotate-3">
              <MessageSquare size={28} strokeWidth={1.5} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 tracking-tight mb-2">
              Inbox is empty
            </h3>
            <p className="text-sm text-slate-500 max-w-sm">
              Your active bartering sessions will securely appear here once a
              trade is initiated.
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {negotiations.map((room) => {
              const isUserA = room.barter.userA.id === currentUserId;
              const partner = isUserA ? room.barter.userB : room.barter.userA;
              const partnerName = partner.fullName || partner.name;

              // Extract what is being traded for context
              const givingPost = isUserA
                ? room.barter.postA
                : room.barter.postB;
              const gettingPost = isUserA
                ? room.barter.postB
                : room.barter.postA;

              const hasMessages = room.messages?.length > 0;
              const latestMsg = hasMessages
                ? room.messages[room.messages.length - 1]
                : null;

              const isUnread = false; // Add real unread logic here later if needed

              return (
                <Link
                  href={`/messages/${room.id}`}
                  key={room.id}
                  className="group relative bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/60 shadow-sm hover:shadow-md hover:border-indigo-200/60 transition-all duration-300 ease-out hover:-translate-y-0.5 flex flex-col sm:flex-row gap-5"
                >
                  {/* Left Column: Avatar & Online Status */}
                  <div className="relative shrink-0 hidden sm:block">
                    <div className="size-14 rounded-full bg-gradient-to-br from-slate-100 to-slate-50 border border-slate-200 flex items-center justify-center overflow-hidden shadow-inner group-hover:scale-105 transition-transform duration-300">
                      {partner.profileImage ? (
                        <img
                          src={partner.profileImage}
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
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 bg-slate-50 border border-slate-100 px-2.5 py-1 rounded-lg">
                        <span className="truncate max-w-[100px] sm:max-w-[150px]">
                          {givingPost?.title}
                        </span>
                        <ArrowRightLeft
                          size={12}
                          className="text-slate-300 shrink-0"
                        />
                        <span className="text-slate-700 truncate max-w-[100px] sm:max-w-[150px]">
                          {gettingPost?.title}
                        </span>
                      </div>

                      {/* Dynamic Status Badge */}
                      <span
                        className={`shrink-0 text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md border ${
                          room.status === "PENDING"
                            ? "bg-amber-50 text-amber-600 border-amber-100/50"
                            : room.status === "AGREED"
                              ? "bg-emerald-50 text-emerald-600 border-emerald-100/50"
                              : "bg-slate-50 text-slate-500 border-slate-200"
                        }`}
                      >
                        {room.status}
                      </span>
                    </div>

                    {/* Partner Name & Message Snippet */}
                    <div className="flex items-baseline justify-between gap-4 mb-1">
                      <h3 className="text-base font-bold text-slate-900 tracking-tight truncate group-hover:text-indigo-600 transition-colors">
                        {partnerName}
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
                      {hasMessages ? (
                        <p
                          className={`truncate ${isUnread ? "text-slate-900 font-semibold" : "text-slate-500 font-medium"}`}
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
