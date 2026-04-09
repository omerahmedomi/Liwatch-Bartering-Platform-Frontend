"use client";

import { useEffect, useRef, useState } from "react";
import { Menu, X, ArrowRight, LogOut, Settings, User } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { div } from "framer-motion/client";

type Props = {
  isLoggedIn: boolean;
};



export default function Navbar({ isLoggedIn }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("liwatch_token");
    window.location.href = "/";
  };

  const navLinks = isLoggedIn
    ? [
        { name: "Listings", href: "/listings" },
        { name: "Messages", href: "#" },
        { name: "Community", href: "#" },
      ]
    : [
        { name: "How it works", href: "/#howitworks" },
        { name: "Explore", href: "#" },
        { name: "Community", href: "#" },
      ];

  return (
    <nav className="fixed top-0 w-full z-100 border-b border-slate-300 bg-white/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        {/* Logo */}

        <Link
          href="/"
          className="flex items-center gap-2 group cursor-pointer"
          aria-label="Go to home"
        >
          <div className="bg-indigo-600 p-px size-10 rounded-full group-hover:rotate-12 transition-transform">
            <img
              src={"/liwatch-logo.png"}
              className="w-full max-w-full rounded-full"
              alt="Logo"
            />
          </div>
          <span className="text-2xl font-black text-slate-900 tracking-tighter italic">
            LIWATCH
          </span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-10 text-slate-600 font-medium text-sm tracking-wide">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="hover:text-indigo-600 transition-colors uppercase"
            >
              {link.name}
            </a>
          ))}
        </div>

        {/* Desktop Auth */}
        {!isLoggedIn ? (
          <div className="hidden md:flex items-center gap-6">
            <Link
              href="/auth?mode=login"
              className="text-slate-700 font-semibold hover:text-indigo-600 transition-colors"
            >
              Log in
            </Link>
            <Link
              href="/auth?mode=signup"
              className="bg-indigo-600 text-white px-6 py-2.5 rounded-full font-bold flex items-center gap-2 hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-500/20 transition-all"
            >
              Join Platform <ArrowRight size={16} />
            </Link>
          </div>
        ) : (
          <div
            className="relative hidden md:block rounded-sm!"
            ref={dropdownRef}
          >
            {/* --- Trigger: Clean & Minimal --- */}
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-2 p-1.5 rounded-full bg-slate-100/50 hover:bg-slate-100 transition-all duration-200 cursor-pointer border border-transparent hover:border-slate-200"
            >
              <div className="size-8 rounded-full bg-indigo-600 ring-2 ring-white flex items-center justify-center text-white text-xs font-black shadow-sm">
                JD
              </div>
              <ChevronDown
                size={14}
                className={`text-slate-500 mr-1 transition-transform duration-300 ${isProfileOpen ? "rotate-180" : ""}`}
              />
            </button>

            {/* --- Menu: Elevated Glass-morphism --- */}
            {isProfileOpen && (
              <div className="absolute right-0 mt-3 top-full w-64 rounded-sm  bg-white/95 backdrop-blur-xl border border-slate-200/60 shadow-[0_20px_50px_rgba(79,70,229,0.1)] overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-300">
                {/* Header: User Context */}
                <div className="px-5 py-4 bg-slate-50/50 border-b border-slate-100 mt-3">
                  <p className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.15em] mb-1">
                    Signed in as
                  </p>
                  <p className="text-sm font-bold text-slate-900 truncate">
                    johndoe@example.com
                  </p>
                </div>

                <div className="p-2 ">
                  {/* Navigation Group */}
                  <div className="space-y-1 *:cursor-pointer">
                    <button
                      onClick={() => router.push("/profile")}
                      className="w-full flex items-center justify-between px-4 py-2.5 rounded-2xl text-slate-600 hover:bg-white hover:shadow-sm hover:text-indigo-600 transition-all group"
                    >
                      <div className="flex items-center gap-3 font-semibold text-sm">
                        <User
                          size={18}
                          className="text-slate-400 group-hover:text-indigo-500"
                        />
                        My Profile
                      </div>
                      <div className="size-1.5 rounded-full bg-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>

                    <button className="w-full flex items-center gap-3 px-4 py-2.5 rounded-2xl text-slate-600 hover:bg-white hover:shadow-sm hover:text-indigo-600 transition-all font-semibold text-sm group">
                      <Settings
                        size={18}
                        className="text-slate-400 group-hover:text-indigo-500"
                      />
                      Settings
                    </button>
                  </div>

                  {/* Separator */}
                  <div className="h-px bg-slate-100 my-2 mx-3" />

                  {/* Action Group */}
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-slate-500 hover:text-red-600 hover:bg-red-50/50 transition-all font-bold text-sm cursor-pointer"
                  >
                    <LogOut size={18} className="opacity-70" />
                    Log out
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Mobile Toggle */}
        <button
          className="md:hidden text-slate-900 p-2 cursor-pointer"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-20 left-0 w-full bg-white border-b border-slate-200 shadow-2xl md:hidden z-[99] overflow-y-auto max-h-[calc(100vh-80px)]"
          >
            {/* --- NEW: Mobile Profile Header (Only if logged in) --- */}
            {isLoggedIn && (
              <div className="px-6 py-6 bg-slate-50/80 border-b border-slate-100">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="size-14 rounded-2xl bg-indigo-600 flex items-center justify-center text-white text-xl font-black shadow-lg shadow-indigo-200">
                      JD
                    </div>
                    <div className="absolute -bottom-1 -right-1 size-4 bg-emerald-500 border-2 border-white rounded-full" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-extrabold text-slate-900 truncate">
                      John Doe
                    </h3>
                    <p className="text-xs font-semibold text-slate-500 truncate mb-2">
                      johndoe@example.com
                    </p>
                    <div className="flex gap-2">
                      <span className="px-2 py-0.5 rounded-md bg-indigo-100 text-[10px] font-bold text-indigo-700 uppercase tracking-wider">
                        Pro Trader
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="p-6 flex flex-col gap-2">
              {/* Navigation Links */}
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="flex items-center justify-between py-4 px-2 text-lg font-bold text-slate-700 border-b border-slate-50 active:bg-slate-50 rounded-xl transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  {link.name}
                  <ChevronDown
                    size={18}
                    className="-rotate-90 text-slate-300"
                  />
                </a>
              ))}

              {/* Auth Actions */}
              {!isLoggedIn ? (
                <div className="flex flex-col gap-4 pt-4">
                  <Link
                    href="/auth?mode=login"
                    onClick={() => setIsOpen(false)}
                    className="w-full py-4 text-slate-700 font-bold border border-slate-200 rounded-2xl text-center active:bg-slate-50"
                  >
                    Log In
                  </Link>
                  <Link
                    href="/auth?mode=signup"
                    onClick={() => setIsOpen(false)}
                    className="w-full py-4 bg-indigo-600 text-white font-bold rounded-2xl shadow-lg shadow-indigo-500/20 text-center active:bg-indigo-700"
                  >
                    Get Started
                  </Link>
                </div>
              ) : (
                <div className="flex flex-col gap-2 pt-4 *:cursor-pointer">
                  {/* Mobile Profile & Settings Links */}
                  <button
                    onClick={() => {
                      router.push("/profile");
                      setIsOpen(false);
                    }}
                    className="w-full flex items-center gap-4 p-4 rounded-2xl text-slate-700 font-bold active:bg-slate-50"
                  >
                    <User size={20} className="text-slate-400" /> My Profile
                  </button>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="w-full flex items-center gap-4 p-4 rounded-2xl text-slate-700 font-bold active:bg-slate-50"
                  >
                    <Settings size={20} className="text-slate-400" /> Settings
                  </button>

                  <div className="h-px bg-slate-100 my-2 mx-4" />

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-4 p-4 rounded-2xl text-red-500 font-bold active:bg-red-50 transition-colors cursor:pointer"
                  >
                    <LogOut size={20} /> Sign Out
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
