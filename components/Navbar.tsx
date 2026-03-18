"use client"; // Required for state and animations

import { useState } from "react";
import { Menu, X, ArrowRight } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { name: "How it works", href: "#" },
    { name: "Explore", href: "#" },
    { name: "Community", href: "#" },
  ];

  return (
    <nav className="fixed top-0 w-full z-[100] border-b border-slate-300 bg-white/80 backdrop-blur-xl">
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

        {/* Mobile Toggle */}
        <button
          className="md:hidden text-slate-900 p-2"
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
            className="absolute top-20 left-0 w-full bg-white border-b border-slate-200 p-6 flex flex-col gap-6 md:hidden z-[99]"
          >
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-xl font-semibold text-slate-900 border-b border-slate-100 pb-4"
                onClick={() => setIsOpen(false)}
              >
                {link.name}
              </a>
            ))}
            <div className="flex flex-col gap-4 pt-4">
              <Link
                href="/auth?mode=login"
                onClick={() => setIsOpen(false)}
                className="w-full py-4 text-slate-700 font-bold border border-slate-200 rounded-2xl text-center"
              >
                Log In
              </Link>
              <Link
                href="/auth?mode=signup"
                onClick={() => setIsOpen(false)}
                className="w-full py-4 bg-indigo-600 text-white font-bold rounded-2xl shadow-lg shadow-indigo-500/20 text-center"
              >
                Get Started
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
