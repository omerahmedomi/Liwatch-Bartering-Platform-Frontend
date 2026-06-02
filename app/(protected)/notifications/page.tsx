"use client";

import { useEffect, useState } from "react";
import { 
  Bell, 
  ArrowLeftRight, 
  ShieldAlert, 
  Award, 
  Check, 
  CheckCheck, 
  Clock,
  Loader2,
  Trash2,
  MessageSquare,
  FileText
} from "lucide-react";
import api from "@/lib/axios";

interface NotificationItem {
  id: number;
  subject: string;
  body: string;
  type: string;
  isRead: boolean;
  sentAt: string;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [actionLoading, setActionLoading] = useState<boolean>(false);

  const fetchNotifications = async () => {
    try {
      const response = await api.get<NotificationItem[]>("/api/notifications");
      setNotifications(response.data);
      
      const countRes = await api.get<number>("/api/notifications/unread-count");
      setUnreadCount(countRes.data);
    } catch (error) {
      console.error("Failed to fetch notifications", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id: number) => {
    // Find the item first to avoid unnecessary updates if already read
    const item = notifications.find(n => n.id === id);
    if (!item || item.isRead || (item as any).read) return;

    try {
      // Optimistic update
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
      
      await api.put(`/api/notifications/${id}/read`);
    } catch (error) {
      console.error("Failed to mark notification as read", error);
      // Revert if error
      fetchNotifications();
    }
  };

  const handleMarkAllAsRead = async () => {
    if (unreadCount === 0) return;
    setActionLoading(true);
    try {
      // Optimistic update
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
      
      await api.put("/api/notifications/read-all");
    } catch (error) {
      console.error("Failed to mark all as read", error);
      fetchNotifications();
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      setNotifications(prev => prev.filter(n => n.id !== id));
      // Re-fetch unread count since deleting might have removed an unread one
      const countRes = await api.get<number>("/api/notifications/unread-count");
      setUnreadCount(countRes.data);

      await api.delete(`/api/notifications/${id}`);
    } catch (error) {
      console.error("Failed to delete notification", error);
      fetchNotifications();
    }
  };

  const handleDeleteAll = async () => {
    if (!window.confirm("Are you sure you want to clear all notifications?")) return;
    setActionLoading(true);
    try {
      setNotifications([]);
      setUnreadCount(0);
      await api.delete("/api/notifications/clear-all");
    } catch (error) {
      console.error("Failed to clear all notifications", error);
      fetchNotifications();
    } finally {
      setActionLoading(false);
    }
  };

  const getRelativeTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffSec = Math.floor(diffMs / 1000);
      const diffMin = Math.floor(diffSec / 60);
      const diffHr = Math.floor(diffMin / 60);
      const diffDays = Math.floor(diffHr / 24);

      if (diffSec < 60) return "Just now";
      if (diffMin < 60) return `${diffMin}m ago`;
      if (diffHr < 24) return `${diffHr}h ago`;
      if (diffDays === 1) return "Yesterday";
      if (diffDays < 7) return `${diffDays}d ago`;
      return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
    } catch (e) {
      return dateString;
    }
  };

  const getIcon = (type: string) => {
    const baseClass = "w-5 h-5";
    switch (type) {
      case "Message":
        return {
          icon: <MessageSquare className={baseClass} />,
          bg: "bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400"
        };
      case "Agreement":
        return {
          icon: <FileText className={baseClass} />,
          bg: "bg-indigo-100 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400"
        };
      case "SWAP_REQUEST":
      case "SWAP_ACCEPTED":
      case "BARTER_REQUEST":
      case "BARTER_REQUEST_ACCEPTED":
        return {
          icon: <ArrowLeftRight className={baseClass} />,
          bg: "bg-blue-100 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400"
        };
      case "ACCOUNT_SUSPENDED":
      case "ACCOUNT_WARNING":
      case "ACCOUNT_POLICY_UPDATE":
      case "POST_FLAGGED":
      case "POST_REMOVED":
        return {
          icon: <ShieldAlert className={baseClass} />,
          bg: "bg-rose-100 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400"
        };
      case "BADGE_CHANGE":
      case "ACCOUNT_VERIFIED":
        return {
          icon: <Award className={baseClass} />,
          bg: "bg-amber-100 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400"
        };
      default:
        return {
          icon: <Bell className={baseClass} />,
          bg: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
        };
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-28 pb-16 transition-colors duration-300">
      <div className="max-w-4xl mx-auto px-6">
        {/* Header section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50 tracking-tight flex items-center gap-3">
              Notifications
              {unreadCount > 0 && (
                <span className="inline-flex items-center justify-center px-3 py-1 text-xs font-semibold rounded-full bg-indigo-600 text-white animate-pulse">
                  {unreadCount} new
                </span>
              )}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              Stay updated with your barter activity, offers, and account alerts.
            </p>
          </div>

          {notifications.length > 0 && (
            <div className="flex gap-2 self-start sm:self-center">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  disabled={actionLoading}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-950/70 border border-indigo-200 dark:border-indigo-900 rounded-xl transition-all duration-200 disabled:opacity-50 cursor-pointer"
                >
                  {actionLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCheck className="w-4 h-4" />
                  )}
                  Mark all as read
                </button>
              )}
              <button
                onClick={handleDeleteAll}
                disabled={actionLoading}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-950/70 border border-red-200 dark:border-red-900 rounded-xl transition-all duration-200 disabled:opacity-50 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                Clear All
              </button>
            </div>
          )}
        </div>

        {/* Notifications list or states */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(n => (
              <div key={n} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-5 flex gap-4 animate-pulse">
                <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-800 shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/4" />
                  <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-3/4" />
                  <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-16" />
                </div>
              </div>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-3xl p-12 text-center shadow-sm">
            <div className="inline-flex items-center justify-center p-4 bg-slate-100 dark:bg-slate-800 rounded-2xl text-slate-400 dark:text-slate-500 mb-4">
              <Bell className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-semibold text-slate-850 dark:text-slate-100">No notifications yet</h3>
            <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-2 text-sm leading-relaxed">
              When you receive barter requests, status updates, or system alerts, they will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification) => {
              const style = getIcon(notification.type);
              return (
                <div
                  key={notification.id}
                  onClick={() => handleMarkAsRead(notification.id)}
                  className={`group relative bg-white dark:bg-slate-900 border transition-all duration-200 rounded-2xl p-5 flex gap-4 cursor-pointer hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700/80 hover:-translate-y-0.5 ${
                    (notification.isRead || (notification as any).read)
                      ? "border-slate-200 dark:border-slate-800/80 opacity-75" 
                      : "border-indigo-150 dark:border-indigo-500/30 bg-indigo-50/10 dark:bg-indigo-900/20 font-medium shadow-sm"
                  }`}
                >
                  {/* Status Indicator Bar */}
                  {!(notification.isRead || (notification as any).read) && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl bg-indigo-650 dark:bg-indigo-500" />
                  )}

                  {/* Icon */}
                  <div className={`p-2.5 rounded-xl shrink-0 h-10 w-10 flex items-center justify-center ${style.bg}`}>
                    {style.icon}
                  </div>

                  {/* Body Content */}
                  <div className="flex-1 space-y-1">
                    <div className="flex items-start justify-between gap-4">
                      <h4 className={`text-base text-slate-900 dark:text-slate-100 ${(notification.isRead || (notification as any).read) ? "font-medium" : "font-bold text-indigo-950 dark:text-white"}`}>
                        {notification.subject}
                      </h4>
                      <span className="text-xs text-slate-400 dark:text-slate-500 shrink-0 flex items-center gap-1.5 mt-0.5">
                        <Clock className="w-3.5 h-3.5" />
                        {getRelativeTime(notification.sentAt)}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed break-words">
                      {notification.body}
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col items-center justify-between">
                    {/* Unread dot indicator */}
                    {!(notification.isRead || (notification as any).read) ? (
                      <div className="shrink-0 w-2.5 h-2.5 rounded-full bg-indigo-600 dark:bg-indigo-400 mb-auto mt-2" />
                    ) : <div className="h-2.5 mb-auto mt-2" />}

                    {/* Delete button */}
                    <button
                      onClick={(e) => handleDelete(notification.id, e)}
                      className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors cursor-pointer mt-auto"
                      title="Clear Notification"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
