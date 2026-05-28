"use client";
import { useState, useEffect, useRef } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { Send, Lock, Loader2, AlertCircle, WifiOff } from "lucide-react";
import api from "@/lib/axios";

interface ChatDto {
  id?: number;
  negotiationId: number;
  senderId: number;
  messageText: string;
  isEncrypted: boolean;
  sentAt: string;
}

export default function ChatPanel({
  currentUserId,
  negotiationId,
  status,
}: any) {
  const [messages, setMessages] = useState<ChatDto[]>([]);
  const [inputText, setInputText] = useState("");
  const [isHistoryLoading, setIsHistoryLoading] = useState(true);

  // Connection States
  const [isBrowserOnline, setIsBrowserOnline] = useState(
    typeof navigator !== "undefined" ? navigator.onLine : true,
  );
  const [isStompConnected, setIsStompConnected] = useState(false);

  const stompClient = useRef<Client | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 1. True Internet Network Manager
  useEffect(() => {
    let pingInterval: NodeJS.Timeout;

    const checkTrueInternet = async () => {
      // Step A: If the hardware says we are offline, don't even bother pinging.
      if (typeof navigator !== "undefined" && !navigator.onLine) {
        setIsBrowserOnline(false);
        setIsStompConnected(false);
        return;
      }

      // Step B: Hardware says we are connected to a router. Let's verify actual internet access.
      try {
        // We do a fast 'HEAD' request to a tiny, static file that always exists in Next.js.
        // We append a timestamp (?cb=) to prevent the browser from giving us a fake cached response.
        const res = await fetch("/favicon.ico?cb=" + Date.now(), {
          method: "HEAD",
          cache: "no-store",
          // 3-second timeout so it doesn't hang forever on bad 4G
          signal: AbortSignal.timeout(3000),
        });

        if (res.ok) {
          setIsBrowserOnline(true);
        } else {
          throw new Error("Connected to router, but no true internet.");
        }
      } catch (error) {
        setIsBrowserOnline(false);
        setIsStompConnected(false);
      }
    };

    // 1. Run the check immediately on load
    checkTrueInternet();

    // 2. Run the check every 5 seconds
    pingInterval = setInterval(checkTrueInternet, 5000);

    // 3. Keep the hardware listeners for instant feedback (if user toggles airplane mode)
    window.addEventListener("online", checkTrueInternet);
    window.addEventListener("offline", () => {
      setIsBrowserOnline(false);
      setIsStompConnected(false);
    });

    return () => {
      clearInterval(pingInterval);
      window.removeEventListener("online", checkTrueInternet);
      window.removeEventListener("offline", () => setIsBrowserOnline(false));
    };
  }, []);

  // 2. Fetch History
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await api.get(
          `/api/negotiation/chat/fetch/${negotiationId}`,
        );
        setMessages(res.data || []);
      } catch (error) {
        console.error("Failed to fetch chat history", error);
      } finally {
        setIsHistoryLoading(false);
      }
    };
    fetchHistory();
  }, [negotiationId]);

  // 3. STOMP Connection Manager
  useEffect(() => {
    // Only attempt to connect if the browser has internet
    if (!isBrowserOnline) return;

    const socket = new SockJS("http://localhost:8080/nego/chat");
    const client = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 3000,
      onConnect: () => {
        setIsStompConnected(true);
        client.subscribe(`/barter/${negotiationId}`, (message) => {
          const receivedMessage: ChatDto = JSON.parse(message.body);
          setMessages((prev) => [...prev, receivedMessage]);
        });
      },
      onDisconnect: () => setIsStompConnected(false),
      onWebSocketClose: () => setIsStompConnected(false),
      onWebSocketError: () => setIsStompConnected(false),
      onStompError: () => setIsStompConnected(false),
    });

    client.activate();
    stompClient.current = client;

    return () => {
      client.deactivate();
    };
  }, [negotiationId, isBrowserOnline]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !isStompConnected) return;

    const messagePayload = {
      negotiationId: negotiationId,
      senderId: currentUserId,
      content: inputText.trim(),
    };

    stompClient.current?.publish({
      destination: "/app/chat.send",
      body: JSON.stringify(messagePayload),
    });

    setInputText("");
  };

  const isChatDisabled = status === "AGREED" || status === "CANCELED";

  if (isHistoryLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="animate-spin text-slate-300" size={24} />
      </div>
    );
  }

  const showOfflineWarning = !isBrowserOnline;
  const showReconnectingWarning = isBrowserOnline && !isStompConnected;
  // --- TELEGRAM-STYLE DATE FORMATTER ---
  const formatDividerDate = (dateString: string) => {
    const msgDate = new Date(dateString);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    if (msgDate.toDateString() === today.toDateString()) {
      return "Today";
    } else if (msgDate.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      // Returns "May 24" (or "May 24, 2025" if it's from a previous year)
      return msgDate.toLocaleDateString(undefined, {
        month: "long",
        day: "numeric",
        year:
          msgDate.getFullYear() !== today.getFullYear() ? "numeric" : undefined,
      });
    }
  };

  return (
    <div className="flex flex-col h-full bg-white relative max-w-4xl mx-auto border-x border-slate-100 shadow-sm">
      {/* Network Disconnected Banner */}
      {showOfflineWarning && (
        <div className="absolute top-0 inset-x-0 z-20 bg-slate-900 text-white px-4 py-2.5 flex items-center justify-center gap-2 text-xs font-bold shadow-md transition-all">
          <WifiOff size={14} /> You are offline. Waiting for network...
        </div>
      )}

      {/* Socket Disconnected/Connecting Banner */}
      {showReconnectingWarning && (
        <div className="absolute top-0 inset-x-0 z-20 bg-amber-100 text-amber-800 px-4 py-2.5 flex items-center justify-center gap-2 text-xs font-bold shadow-md border-b border-amber-200 transition-all">
          <Loader2 className="animate-spin" size={14} /> Connecting to secure
          server...
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-4 sm:p-6 pt-10 space-y-6">
        <div className="text-center mt-2 mb-8">
          <span className="inline-flex items-center gap-1.5 bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border border-slate-100">
            <Lock size={12} /> Encrypted Session
          </span>
        </div>

        {messages.map((msg, index) => {
          const isMe = msg.senderId === currentUserId;

          // 1. DATE LOGIC: Check if this message is the first of a new day
          const showDateDivider =
            index === 0 ||
            new Date(msg.sentAt).toDateString() !==
              new Date(messages[index - 1].sentAt).toDateString();

          return (
            // Moved the key up here to wrap both the divider and the bubble
            <div key={msg.id || index} className="flex flex-col w-full">
              {/* 2. THE DATE PILL: Only renders if it's a new day */}
              {showDateDivider && (
                <div className="flex justify-center my-4">
                  <span className="bg-slate-100 text-slate-500 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full shadow-sm">
                    {formatDividerDate(msg.sentAt)}
                  </span>
                </div>
              )}

              {/* 3. YOUR EXACT EXISTING BUBBLE CODE (Untouched) */}
              <div
                className={`flex ${isMe ? "justify-end" : "justify-start"} mb-2`}
              >
                <div
                  className={`
                    max-w-[65%] px-4 py-3 rounded-2xl text-[15px] shadow-sm leading-relaxed break-words
                    ${
                      isMe
                        ? "bg-indigo-600 text-white rounded-br-sm"
                        : "bg-[#F3F4F6] text-slate-900 rounded-bl-sm"
                    }
                  `}
                >
                  <p className="whitespace-pre-wrap">{msg.messageText}</p>

                  <div
                    className={`flex w-full justify-end text-[10px] font-bold mt-1.5 ${
                      isMe ? "text-indigo-200" : "text-slate-400"
                    }`}
                  >
                    {new Date(msg.sentAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 sm:p-5 bg-white border-t border-slate-100">
        {isChatDisabled ? (
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center justify-center gap-2 text-slate-500 text-sm font-bold">
            <AlertCircle size={18} /> This negotiation has concluded.
          </div>
        ) : (
          <form
            onSubmit={handleSendMessage}
            className="flex items-center gap-3"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={
                isStompConnected
                  ? "Type a message..."
                  : "Waiting for connection..."
              }
              disabled={!isStompConnected || !isBrowserOnline}
              className="flex-1 bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-full px-5 py-3.5 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all disabled:opacity-50 disabled:bg-slate-100"
            />
            <button
              type="submit"
              disabled={
                !inputText.trim() || !isStompConnected || !isBrowserOnline
              }
              className="size-12 shrink-0 bg-indigo-600 text-white rounded-full flex items-center justify-center shadow-sm hover:bg-indigo-700 hover:shadow-md hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:hover:bg-indigo-600 disabled:hover:shadow-sm disabled:hover:translate-y-0"
            >
              <Send size={18} className="-ml-0.5" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
