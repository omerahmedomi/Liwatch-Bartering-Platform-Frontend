"use client";
import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import api from "@/lib/axios";
import { Loader2, Send, ArrowLeft, ArrowRight, FileSignature, CheckCircle, X } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import CycleDigitalAgreementPanel from "./CycleDigitalAgreementPanel";
import { ShieldCheck } from "lucide-react";

export default function CycleNegotiationRoom() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();

  const [room, setRoom] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [messageInput, setMessageInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const fetchRoom = async () => {
    try {
      const userRes = await api.get("/api/profile/me");
      setCurrentUser(userRes.data?.user);

      const res = await api.get(`/api/cycle-negotiation/${id}`);
      setRoom(res.data);
      scrollToBottom();
    } catch (err) {
      toast.error("Failed to load negotiation room");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoom();
    const interval = setInterval(fetchRoom, 5000);
    return () => clearInterval(interval);
  }, [id]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim()) return;

    const currentMsg = messageInput;
    setMessageInput("");

    try {
      await api.post(`/api/cycle-negotiation/${id}/messages`, { message: currentMsg });
      fetchRoom();
    } catch (err) {
      toast.error("Failed to send message");
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center">
        <Loader2 className="animate-spin text-indigo-600" size={40} />
      </main>
    );
  }

  if (!room) return <div className="p-8 text-center">Room not found</div>;

  const req = room.requestDetails;
  
  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-20 pb-24 flex flex-col">
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-4 sticky top-20 z-10 shadow-sm flex flex-col gap-4">
        <div className="max-w-4xl mx-auto flex w-full items-center gap-4">
          <button onClick={() => router.push("/messages")} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full shrink-0">
            <ArrowLeft size={20} />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="font-bold text-lg truncate">3-Way Cycle Negotiation</h1>
            <p className="text-xs text-slate-500 truncate">
              {req.initiator.name}, {req.middleman.name}, and {req.closer.name}
            </p>
          </div>
          
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-sm hover:shadow-md transition-all shrink-0 cursor-pointer"
          >
            <FileSignature size={14} />
            <span className="hidden sm:inline">Review Agreement</span>
            <span className="sm:hidden">Agreement</span>
          </button>

          <Link href="/trust-center">
            <button className="hidden md:flex items-center gap-2 px-4 py-2 bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400 rounded-xl text-xs font-bold hover:bg-indigo-100 dark:hover:bg-indigo-900 transition-colors shadow-sm border border-indigo-100 dark:border-indigo-900 shrink-0">
              <ShieldCheck size={16} /> Trust Center
            </button>
          </Link>
        </div>
      </div>

      <div className="max-w-2xl mx-auto w-full p-4 flex-1 flex flex-col relative">
        {/* Trade Context Map */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 mb-6 shadow-sm shrink-0">
          <div className="text-center w-full md:w-1/3">
            <p className="text-xs text-slate-400 font-bold mb-1">{req.initiator.name} gives</p>
            <p className="font-bold text-indigo-600">{req.postA.title}</p>
          </div>
          <ArrowRight className="text-slate-300 rotate-90 md:rotate-0" />
          <div className="text-center w-full md:w-1/3">
            <p className="text-xs text-slate-400 font-bold mb-1">{req.middleman.name} gives</p>
            <p className="font-bold text-emerald-600">{req.postB.title}</p>
          </div>
          <ArrowRight className="text-slate-300 rotate-90 md:rotate-0" />
          <div className="text-center w-full md:w-1/3">
            <p className="text-xs text-slate-400 font-bold mb-1">{req.closer.name} gives</p>
            <p className="font-bold text-amber-600">{req.postC.title}</p>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 space-y-4 pb-4">
          {room.messages.map((msg: any) => {
            const isMe = msg.senderId === currentUser?.id;
            return (
              <div key={msg.id} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                <span className="text-[10px] text-slate-500 mb-1 ml-1 font-semibold uppercase tracking-wider">{msg.senderName}</span>
                <div className={`px-4 py-2.5 rounded-2xl max-w-[80%] shadow-sm ${isMe ? "bg-indigo-600 text-white rounded-br-sm" : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-bl-sm"}`}>
                  <p className="text-sm">{msg.message}</p>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Chat Input */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 p-4 z-20">
        <div className="max-w-2xl mx-auto">
          <form onSubmit={handleSendMessage} className="flex items-center gap-2">
            <input
              type="text"
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              placeholder="Message the cycle group..."
              className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full px-6 py-3 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all shadow-sm"
            />
            <button
              type="submit"
              disabled={!messageInput.trim()}
              className="bg-indigo-600 text-white p-3.5 rounded-full hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-md cursor-pointer"
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      </div>

      {/* Universal Modal Overlay for Cycle Agreement */}
      {isModalOpen &&
        isMounted &&
        createPortal(
          <div
            className="fixed inset-0 flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200"
            style={{ zIndex: 999999 }}
          >
            <div
              className="absolute inset-0 backdrop-blur-md"
              style={{ backgroundColor: "rgba(15, 23, 42, 0.4)" }}
              onClick={() => setIsModalOpen(false)}
            />

            <div className="relative w-full max-w-[500px] max-h-[90vh] flex flex-col bg-[#FAFAFA] dark:bg-slate-950 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800/60 bg-white dark:bg-slate-900">
                <h2 className="text-xs font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 flex items-center gap-2">
                  <ShieldCheck size={16} className="text-indigo-600" />
                  Cycle Trust Center
                </h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-800 bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="overflow-y-auto p-4 sm:p-5">
                <CycleDigitalAgreementPanel
                  room={room}
                  currentUser={currentUser}
                  onRefresh={fetchRoom}
                />
              </div>
            </div>
          </div>,
          document.body,
        )}
    </main>
  );
}
