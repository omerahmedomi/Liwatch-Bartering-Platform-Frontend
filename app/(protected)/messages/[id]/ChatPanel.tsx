"use client";
import { useState, useEffect, useRef } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { Send, Lock, Loader2, AlertCircle, WifiOff, Paperclip, FileText, X, Image } from "lucide-react";
import api from "@/lib/axios";

interface ChatDto {
  id?: number;
  negotiationId: number;
  senderId: number;
  messageText: string;
  isEncrypted: boolean;
  isRead?: boolean;
  read?: boolean;
  fileUrl?: string;
  fileName?: string;
  fileType?: string;
  sentAt: string;
}

export default function ChatPanel({
  currentUserId,
  negotiationId,
  status,
  onPartnerStatusChange,
  onPartnerTypingChange,
}: any) {
  const [messages, setMessages] = useState<ChatDto[]>([]);
  const [inputText, setInputText] = useState("");
  const [isHistoryLoading, setIsHistoryLoading] = useState(true);

  // Attachment states
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [fileDetails, setFileDetails] = useState<{ url: string; name: string; type: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Connection States
  const [isBrowserOnline, setIsBrowserOnline] = useState(
    typeof navigator !== "undefined" ? navigator.onLine : true,
  );
  const [isStompConnected, setIsStompConnected] = useState(false);

  const stompClient = useRef<Client | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lastPresenceRef = useRef<number | null>(null);
  const isTypingRef = useRef(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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
      if (typeof navigator !== "undefined" && !navigator.onLine) {
        setIsBrowserOnline(false);
        setIsStompConnected(false);
        return;
      }

      try {
        const res = await fetch("/favicon.ico?cb=" + Date.now(), {
          method: "HEAD",
          cache: "no-store",
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

    checkTrueInternet();
    pingInterval = setInterval(checkTrueInternet, 5000);

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
    if (!isBrowserOnline) return;

    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_BASE_URL || "http://localhost:8080";
    const socket = new SockJS(`${backendUrl}/nego/chat`);
    const client = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 3000,
      onConnect: () => {
        setIsStompConnected(true);

        // Message receiver
        client.subscribe(`/barter/${negotiationId}`, (message) => {
          const received: any = JSON.parse(message.body);
          const receivedMessage: ChatDto = {
            id: received.id,
            negotiationId: received.negotiationId || (received.negotiation ? received.negotiation.id : negotiationId),
            senderId: received.senderId || (received.sender ? received.sender.id : undefined),
            messageText: received.messageText,
            isEncrypted: received.isEncrypted,
            isRead: received.isRead,
            read: received.read,
            fileUrl: received.fileUrl,
            fileName: received.fileName,
            fileType: received.fileType,
            sentAt: received.sentAt
          };
          setMessages((prev) => [...prev, receivedMessage]);
        });

        // Presence listener
        client.subscribe(
          `/topic/negotiation.${negotiationId}.presence`,
          (message) => {
            const data = JSON.parse(message.body);
            if (data.userId !== currentUserId) {
              if (data.status === "ONLINE") {
                onPartnerStatusChange?.(true);
                lastPresenceRef.current = Date.now();
              } else if (data.status === "OFFLINE") {
                onPartnerStatusChange?.(false);
              }
            }
          },
        );

        // Typing listener
        client.subscribe(
          `/topic/negotiation.${negotiationId}.typing`,
          (message) => {
            const data = JSON.parse(message.body);
            if (data.userId !== currentUserId) {
              onPartnerTypingChange?.(data.isTyping);
            }
          },
        );
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
  }, [negotiationId, isBrowserOnline, currentUserId, onPartnerStatusChange, onPartnerTypingChange]);

  // 4. Presence Pinging (Heartbeat) and Timeout Checker
  useEffect(() => {
    if (!isStompConnected) return;

    // Send heartbeat immediately on connect
    stompClient.current?.publish({
      destination: `/topic/negotiation.${negotiationId}.presence`,
      body: JSON.stringify({ userId: currentUserId, status: "ONLINE" }),
    });

    // Send heartbeat every 4 seconds
    const pingInterval = setInterval(() => {
      stompClient.current?.publish({
        destination: `/topic/negotiation.${negotiationId}.presence`,
        body: JSON.stringify({ userId: currentUserId, status: "ONLINE" }),
      });
    }, 4000);

    // Check every 2 seconds if partner has timed out (offline)
    const checkInterval = setInterval(() => {
      if (
        lastPresenceRef.current &&
        Date.now() - lastPresenceRef.current > 9000
      ) {
        onPartnerStatusChange?.(false);
      }
    }, 2000);

    return () => {
      clearInterval(pingInterval);
      clearInterval(checkInterval);
    };
  }, [isStompConnected, negotiationId, currentUserId, onPartnerStatusChange]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputText(val);

    if (!isStompConnected) return;

    if (!isTypingRef.current && val.trim().length > 0) {
      isTypingRef.current = true;
      stompClient.current?.publish({
        destination: `/topic/negotiation.${negotiationId}.typing`,
        body: JSON.stringify({ userId: currentUserId, isTyping: true }),
      });
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      if (isTypingRef.current) {
        isTypingRef.current = false;
        stompClient.current?.publish({
          destination: `/topic/negotiation.${negotiationId}.typing`,
          body: JSON.stringify({ userId: currentUserId, isTyping: false }),
        });
      }
    }, 3000);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPendingFile(file);
    setIsUploading(true);
    try {
      const { uploadFileToCloudinary } = await import("@/lib/cloudinary");
      const url = await uploadFileToCloudinary(file);
      setFileDetails({
        url,
        name: file.name,
        type: file.type
      });
    } catch (err) {
      console.error("Cloudinary upload failed:", err);
      alert("Failed to upload attachment. Please try again.");
      setPendingFile(null);
      setFileDetails(null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (isUploading) return;

    const hasText = !!inputText.trim();
    const hasFile = !!fileDetails;
    if ((!hasText && !hasFile) || !isStompConnected) return;

    const messagePayload = {
      negotiationId: negotiationId,
      senderId: currentUserId,
      content: inputText.trim(),
      fileUrl: fileDetails?.url || null,
      fileName: fileDetails?.name || null,
      fileType: fileDetails?.type || null,
    };

    stompClient.current?.publish({
      destination: "/app/chat.send",
      body: JSON.stringify(messagePayload),
    });

    setInputText("");
    setPendingFile(null);
    setFileDetails(null);
    if (fileInputRef.current) fileInputRef.current.value = "";

    if (isTypingRef.current) {
      isTypingRef.current = false;
      stompClient.current?.publish({
        destination: `/topic/negotiation.${negotiationId}.typing`,
        body: JSON.stringify({ userId: currentUserId, isTyping: false }),
      });
    }
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
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
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 relative max-w-4xl mx-auto border-x border-slate-100 dark:border-slate-800 shadow-sm">
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
          <span className="inline-flex items-center gap-1.5 bg-slate-50 dark:bg-slate-950 text-slate-400 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border border-slate-100 dark:border-slate-800">
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
                  <span className="bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full shadow-sm">
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
                        : "bg-[#F3F4F6] dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-bl-sm"
                    }
                  `}
                >
                  {/* Inline Image Attachment */}
                  {msg.fileUrl && msg.fileType?.startsWith("image/") && (
                    <div className="mb-2 max-w-full overflow-hidden rounded-xl border border-slate-100 dark:border-slate-850">
                      <a href={msg.fileUrl} target="_blank" rel="noopener noreferrer" className="block relative group">
                        <img src={msg.fileUrl} alt={msg.fileName || "Image attachment"} className="max-h-60 object-contain w-full hover:scale-[1.02] transition-transform duration-200" />
                        <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <span className="text-white text-xs font-semibold bg-black/40 px-2.5 py-1 rounded-full backdrop-blur-sm">Open original</span>
                        </div>
                      </a>
                    </div>
                  )}

                  {/* File/Document Attachment */}
                  {msg.fileUrl && !msg.fileType?.startsWith("image/") && (
                    <div className={`mb-2 p-3 rounded-xl border flex items-center justify-between gap-3 shadow-sm ${
                      isMe 
                        ? "bg-indigo-700/50 border-indigo-500 text-white" 
                        : "bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200"
                    }`}>
                      <div className="flex items-center gap-2 overflow-hidden">
                        <FileText size={20} className={isMe ? "text-indigo-200" : "text-indigo-600 dark:text-indigo-400"} />
                        <span className="text-xs font-semibold truncate max-w-[150px]">{msg.fileName || "Attachment"}</span>
                      </div>
                      <a 
                        href={msg.fileUrl} 
                        download={msg.fileName || "download"}
                        target="_blank" 
                        rel="noopener noreferrer"
                        className={`text-xs font-bold px-2.5 py-1.5 rounded-lg border transition-all ${
                          isMe 
                            ? "bg-indigo-600 border-indigo-400 hover:bg-indigo-500 text-white" 
                            : "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                        }`}
                      >
                        Download
                      </a>
                    </div>
                  )}

                  {msg.messageText && (
                    <p className="whitespace-pre-wrap">{msg.messageText}</p>
                  )}

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

      <div className="p-4 sm:p-5 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
        {isChatDisabled ? (
          <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex items-center justify-center gap-2 text-slate-500 dark:text-slate-400 text-sm font-bold">
            <AlertCircle size={18} /> This negotiation has concluded.
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {/* File Attachment Preview */}
            {pendingFile && (
              <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-between gap-3 shadow-sm max-w-sm">
                <div className="flex items-center gap-2 overflow-hidden">
                  {pendingFile.type.startsWith("image/") ? (
                    <div className="size-10 rounded bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 overflow-hidden border border-slate-200 dark:border-slate-700">
                      {fileDetails?.url ? (
                        <img src={fileDetails.url} alt="preview" className="object-cover size-full" />
                      ) : (
                        <Image size={18} className="text-slate-400 animate-pulse" />
                      )}
                    </div>
                  ) : (
                    <div className="size-10 rounded bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center shrink-0 border border-indigo-100 dark:border-indigo-900">
                      <FileText size={18} className="text-indigo-600 dark:text-indigo-400" />
                    </div>
                  )}
                  <div className="text-xs truncate text-slate-700 dark:text-slate-300">
                    <p className="font-semibold truncate">{pendingFile.name}</p>
                    <p className="text-[10px] text-slate-400">
                      {isUploading ? "Uploading..." : "Ready to send"}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setPendingFile(null);
                    setFileDetails(null);
                    setIsUploading(false);
                    if (fileInputRef.current) fileInputRef.current.value = "";
                  }}
                  className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X size={14} />
                </button>
              </div>
            )}

            <form
              onSubmit={handleSendMessage}
              className="flex items-center gap-3"
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                disabled={!isStompConnected || !isBrowserOnline}
              />
              
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={!isStompConnected || !isBrowserOnline || isUploading}
                className="size-12 shrink-0 bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 rounded-full flex items-center justify-center shadow-sm transition-all disabled:opacity-50"
                title="Attach file or image"
              >
                <Paperclip size={18} />
              </button>

              <input
                type="text"
                value={inputText}
                onChange={handleInputChange}
                placeholder={
                  isStompConnected
                    ? "Type a message..."
                    : "Waiting for connection..."
                }
                disabled={!isStompConnected || !isBrowserOnline}
                className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 text-sm rounded-full px-5 py-3.5 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all disabled:opacity-50 disabled:bg-slate-100"
              />
              <button
                type="submit"
                disabled={
                  (!inputText.trim() && !fileDetails) || isUploading || !isStompConnected || !isBrowserOnline
                }
                className="size-12 shrink-0 bg-indigo-600 text-white rounded-full flex items-center justify-center shadow-sm hover:bg-indigo-700 hover:shadow-md hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:hover:bg-indigo-600 disabled:hover:shadow-sm disabled:hover:translate-y-0"
              >
                {isUploading ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  <Send size={18} className="-ml-0.5" />
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
