"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  Users, 
  Layers, 
  ArrowLeftRight, 
  Flag, 
  UsersRound,
  ShieldCheck,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Loader2
} from "lucide-react";
import api from "@/lib/axios";

interface StatsData {
  totalUsers: number;
  activeUsers: number;
  suspendedUsers: number;
  unverifiedUsers: number;
  newUsersLast30Days: number;
  totalPosts: number;
  activePosts: number;
  removedPosts: number;
  itemPosts: number;
  servicePosts: number;
  totalBarters: number;
  completedBarters: number;
  activeBarters: number;
  totalReports: number;
  pendingReports: number;
  resolvedReports: number;
  totalGroups: number;
  activeGroups: number;
  badgeDistribution: Record<string, number>;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/api/admin/stats")
      .then(res => {
        setStats(res.data?.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching admin stats:", err);
        setError("Failed to compile platform statistics.");
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center">
        <Loader2 className="animate-spin text-indigo-500 mb-4" size={32} />
        <p className="text-slate-600 dark:text-slate-400 font-medium">Aggregating real-time telemetry...</p>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 text-center max-w-lg mx-auto mt-12">
        <AlertTriangle className="text-red-600 dark:text-red-400 mx-auto mb-3" size={36} />
        <h3 className="text-lg font-bold text-red-200">Telemetry Sync Failed</h3>
        <p className="text-sm text-red-300/80 mt-1">{error || "Could not reach stats server."}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-4 bg-red-500/20 hover:bg-red-500/30 text-red-200 border border-red-500/40 px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer"
        >
          Retry Sync
        </button>
      </div>
    );
  }

  const primaryCards = [
    { 
      title: "Total Registered Users", 
      value: stats.totalUsers, 
      desc: `${stats.activeUsers} Active • ${stats.suspendedUsers} Suspended`, 
      icon: Users,
      color: "from-blue-600/20 to-indigo-600/10 border-blue-500/20 text-blue-400"
    },
    { 
      title: "Active Listings (Posts)", 
      value: stats.totalPosts, 
      desc: `${stats.itemPosts} Items • ${stats.servicePosts} Services`, 
      icon: Layers,
      color: "from-emerald-600/20 to-teal-600/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
    },
    { 
      title: "Completed Exchanges", 
      value: stats.completedBarters, 
      desc: `${stats.activeBarters} Swapping In Progress`, 
      icon: ArrowLeftRight,
      color: "from-amber-600/20 to-orange-600/10 border-amber-500/20 text-amber-600 dark:text-amber-400"
    },
    { 
      title: "Disputes & Reports", 
      value: stats.totalReports, 
      desc: `${stats.pendingReports} Unresolved Queue`, 
      icon: Flag,
      color: "from-rose-600/20 to-red-600/10 border-rose-500/20 text-rose-600 dark:text-rose-400",
      highlight: stats.pendingReports > 0
    }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Intro Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-slate-100">
            Overview Dashboard
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Real-time platform performance, user metrics, and moderation status.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 px-4 py-2.5 rounded-xl">
          <Sparkles size={16} className="text-indigo-600 dark:text-indigo-400 animate-pulse" />
          <span className="text-xs font-bold text-indigo-200">All Systems Operational</span>
        </div>
      </div>

      {/* Main Metric Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {primaryCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div 
              key={i}
              className={`relative bg-gradient-to-br ${card.color} border backdrop-blur-md rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl`}
            >
              {card.highlight && (
                <span className="absolute top-3 right-3 size-2.5 bg-red-500 rounded-full animate-ping" />
              )}
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    {card.title}
                  </p>
                  <h3 className="text-3xl font-black text-slate-900 dark:text-slate-100 mt-2 tracking-tight">
                    {card.value}
                  </h3>
                </div>
                <div className="p-3 bg-white dark:bg-slate-950/40 rounded-xl">
                  <Icon size={20} className={card.color.split(" ").slice(-1)[0]} />
                </div>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-4 font-medium">
                {card.desc}
              </p>
            </div>
          );
        })}
      </div>

      {/* Secondary Metrics & Badge Level Chart Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Badge Level Distribution Card */}
        <div className="lg:col-span-2 bg-slate-100 dark:bg-slate-900/40 backdrop-blur-md border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 space-y-6">
          <div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">
              Trader Badge Distributions
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
              Breakdown of registered user profiles by trust badge level achievements.
            </p>
          </div>

          <div className="space-y-4">
            {Object.entries(stats.badgeDistribution).map(([level, count]) => {
              const maxCount = Math.max(...Object.values(stats.badgeDistribution), 1);
              const percentage = (count / stats.totalUsers) * 100 || 0;
              const barWidth = (count / maxCount) * 100;
              return (
                <div key={level} className="space-y-2">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-700 dark:text-slate-300">{level.replace("_", " ")}</span>
                    <span className="text-slate-600 dark:text-slate-400">{count} users ({percentage.toFixed(0)}%)</span>
                  </div>
                  <div className="h-3 w-full bg-white dark:bg-slate-950 rounded-full overflow-hidden border border-slate-200 dark:border-slate-800/60 p-0.5">
                    <div 
                      className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-1000"
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Operations Console */}
        <div className="bg-slate-100 dark:bg-slate-900/40 backdrop-blur-md border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">
                Moderation Actions
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                Direct access to core administrative queues and functions.
              </p>
            </div>

            <div className="space-y-3">
              <Link 
                href="/admin/users"
                className="w-full flex items-center justify-between p-3.5 bg-white dark:bg-slate-950/40 hover:bg-indigo-500/10 border border-slate-200 dark:border-slate-800 hover:border-indigo-500/30 rounded-xl group transition-all duration-300"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg group-hover:bg-blue-500/20 transition-colors">
                    <Users size={16} />
                  </div>
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 group-hover:text-slate-800 dark:text-slate-200">
                    Manage Users
                  </span>
                </div>
                <ArrowRight size={14} className="text-slate-500 group-hover:text-indigo-600 dark:text-indigo-400 group-hover:translate-x-1 transition-all" />
              </Link>

              <Link 
                href="/admin/reports"
                className="w-full flex items-center justify-between p-3.5 bg-white dark:bg-slate-950/40 hover:bg-rose-500/10 border border-slate-200 dark:border-slate-800 hover:border-rose-500/30 rounded-xl group transition-all duration-300"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-lg group-hover:bg-rose-500/20 transition-colors">
                    <Flag size={16} />
                  </div>
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 group-hover:text-slate-800 dark:text-slate-200">
                    Review Disputes
                  </span>
                </div>
                <ArrowRight size={14} className="text-slate-500 group-hover:text-rose-600 dark:text-rose-400 group-hover:translate-x-1 transition-all" />
              </Link>

              <Link 
                href="/admin/listings"
                className="w-full flex items-center justify-between p-3.5 bg-white dark:bg-slate-950/40 hover:bg-emerald-500/10 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/30 rounded-xl group transition-all duration-300"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg group-hover:bg-emerald-500/20 transition-colors">
                    <Layers size={16} />
                  </div>
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 group-hover:text-slate-800 dark:text-slate-200">
                    Moderate Listings
                  </span>
                </div>
                <ArrowRight size={14} className="text-slate-500 group-hover:text-emerald-600 dark:text-emerald-400 group-hover:translate-x-1 transition-all" />
              </Link>

              <Link 
                href="/admin/verify"
                className="w-full flex items-center justify-between p-3.5 bg-white dark:bg-slate-950/40 hover:bg-violet-500/10 border border-slate-200 dark:border-slate-800 hover:border-violet-500/30 rounded-xl group transition-all duration-300"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-violet-500/10 text-violet-600 dark:text-violet-400 rounded-lg group-hover:bg-violet-500/20 transition-colors">
                    <ShieldCheck size={16} />
                  </div>
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 group-hover:text-slate-800 dark:text-slate-200">
                    Verify Trade Receipt Key
                  </span>
                </div>
                <ArrowRight size={14} className="text-slate-500 group-hover:text-violet-600 dark:text-violet-450 group-hover:translate-x-1 transition-all" />
              </Link>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-800/60 flex items-center gap-3 text-slate-600 dark:text-slate-400">
            <ShieldCheck size={16} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
            <p className="text-[10px] font-medium leading-normal">
              Admin console activities are logged. Actions taken on profiles or posts automatically dispatch email & push alerts.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
