"use client";
import {Playwrite_US_Modern} from 'next/font/google';
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Users, 
  Flag, 
  Layers, 
  ArrowLeftRight, 
  LogOut, 
  ChevronRight,
  ShieldAlert,
  History
} from "lucide-react";
import AdminGuard from "@/components/AdminGuard";
import api from "@/lib/axios";

const usModern = Playwrite_US_Modern({
  variable: "--font-modern",
  // subsets: ["latin"],
});

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [adminEmail, setAdminEmail] = useState("");
  const [adminName, setAdminName] = useState("");

  useEffect(() => {
    api.get("/api/profile/me")
      .then(res => {
        setAdminEmail(res.data?.user?.email || "admin@liwatch.com");
        setAdminName(res.data?.user?.name || "System Admin");
      })
      .catch(() => {
        setAdminEmail("admin@liwatch.com");
        setAdminName("System Admin");
      });
  }, []);

  const navItems = [
    { name: "Overview", href: "/admin", icon: LayoutDashboard },
    { name: "Users", href: "/admin/users", icon: Users },
    { name: "Reports", href: "/admin/reports", icon: Flag },
    { name: "Listings", href: "/admin/listings", icon: Layers },
    { name: "Action Logs", href: "/admin/logs", icon: History },
  ];

  return (
    <AdminGuard>
      <div className={`min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex relative overflow-hidden `}>
        {/* Dynamic Colorful Glow Blobs */}
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-violet-600/10 blur-[120px] pointer-events-none" />

        {/* Sidebar */}
        <aside className="w-72 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl border-r border-slate-200 dark:border-slate-800/80 flex flex-col justify-between z-10 shrink-0">
          <div>
            {/* Brand Logo */}
            <div className="p-6 border-b border-slate-200 dark:border-slate-800/60 flex items-center gap-3">
              <div className="size-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <ShieldAlert size={20} className="text-white" />
              </div>
              <div>
                <h1 className="text-lg font-black tracking-tight bg-gradient-to-r from-indigo-700 to-violet-700 dark:from-indigo-200 dark:to-violet-400 bg-clip-text text-transparent">
                  LIWATCH ADMIN
                </h1>
                <p className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">
                  Control Center
                </p>
              </div>
            </div>

            {/* Navigation links */}
            <nav className="p-4 space-y-1.5 mt-6">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300 group ${
                      isActive 
                        ? "bg-gradient-to-r from-indigo-600/10 dark:from-indigo-600/30 to-violet-600/10 dark:to-violet-600/20 border border-indigo-500/20 dark:border-indigo-500/30 text-indigo-700 dark:text-indigo-200 shadow-lg shadow-indigo-500/5 font-semibold" 
                        : "hover:bg-slate-100 dark:hover:bg-slate-800/40 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-800 dark:text-slate-200 border border-transparent"
                    }`}
                  >
                    <div className="flex items-center gap-3 text-sm">
                      <Icon size={18} className={isActive ? "text-indigo-600 dark:text-indigo-400" : "text-slate-500 group-hover:text-slate-900 dark:group-hover:text-slate-700 dark:text-slate-300 transition-colors"} />
                      {item.name}
                    </div>
                    <ChevronRight 
                      size={14} 
                      className={`transition-all duration-300 ${
                        isActive 
                          ? "opacity-100 translate-x-0 text-indigo-600 dark:text-indigo-400" 
                          : "opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 text-slate-500"
                      }`} 
                    />
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Admin Info Profile Footer */}
          <div className="p-4 border-t border-slate-200 dark:border-slate-800/60 bg-white/30 dark:bg-slate-900/30">
            <div className="flex items-center gap-3 p-2">
              <div className="size-10 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center font-bold text-white text-sm shadow-inner">
                {adminName.substring(0, 2).toUpperCase()}
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-bold text-slate-900 dark:text-slate-200 truncate">{adminName}</p>
                <p className="text-[11px] text-slate-500 truncate">{adminEmail}</p>
              </div>
            </div>

            <div className="h-px bg-slate-200 dark:bg-slate-800/40 my-3" />

            <Link
              href="/listings"
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/40 transition-all text-xs font-semibold"
            >
              <ArrowLeftRight size={14} className="text-slate-500" />
              Exit to Platform
            </Link>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto z-10 flex flex-col min-w-0">
          {/* Header Navbar */}
          <header className="h-20 border-b border-slate-200 dark:border-slate-800/60 px-8 flex items-center justify-between shrink-0 bg-white/20 dark:bg-slate-950/20 backdrop-blur-md">
            <div>
              <h2 className="text-sm font-black tracking-widest text-slate-500 uppercase">
                System Administrator
              </h2>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-xs bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 px-3 py-1 rounded-full border border-indigo-500/20 font-semibold tracking-wide">
                Production Environment
              </span>
            </div>
          </header>

          {/* Content Wrapper */}
          <div className="flex-1 p-8">
            {children}
          </div>
        </main>
      </div>
    </AdminGuard>
  );
}
