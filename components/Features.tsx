"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Search,
  ShieldCheck,
  MessageSquare,
  Star,
  Bell,
  UserCheck,
} from "lucide-react";

const featureData = [
  {
    title: "Smart Discovery",
    desc: "Find the perfect match for your items with our intelligent search and recommendation system.",
    icon: <Search className="text-blue-400" />,
  },
  {
    title: "Secure Exchanges",
    desc: "Complete trades with confidence using our digital agreement system and escrow protection.",
    icon: <ShieldCheck className="text-emerald-400" />,
  },
  {
    title: "Real-time Chat",
    desc: "Negotiate terms seamlessly with built-in messaging, file sharing, and instant notifications.",
    icon: <MessageSquare className="text-purple-400" />,
  },
  {
    title: "Trust & Ratings",
    desc: "Build your reputation with our comprehensive rating system and verified user badges.",
    icon: <Star className="text-yellow-400" />,
  },
  {
    title: "Instant Alerts",
    desc: "Never miss an opportunity with real-time notifications for matches and messages.",
    icon: <Bell className="text-pink-400" />,
  },
  {
    title: "Safe & Verified",
    desc: "Trade with peace of mind knowing all users are verified and transactions are protected.",
    icon: <UserCheck className="text-cyan-400" />,
  },
];

export default function Features() {
  return (
    <section className="py-24 bg-slate-950 relative overflow-hidden">
      {/* Suble background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-black text-white mb-6"
          >
            Everything You Need to Trade
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-slate-400 text-lg md:text-xl"
          >
            Powerful features designed to make bartering simple, secure, and
            enjoyable for everyone.
          </motion.p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featureData.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group relative p-8 rounded-3xl bg-white/5 border border-white/10 hover:border-blue-500/50 hover:bg-white/[0.07] transition-all duration-300"
            >
              <div className="mb-6 inline-flex p-3 rounded-2xl bg-slate-900 border border-white/5 group-hover:scale-110 group-hover:bg-blue-500/10 transition-all duration-300">
                {React.cloneElement(feature.icon as React.ReactElement, {
                  size: 28,
                })}
              </div>
              <h3 className="text-xl font-bold text-white mb-3 group-hover:text-blue-400 transition-colors">
                {feature.title}
              </h3>
              <p className="text-slate-400 leading-relaxed text-sm md:text-base">
                {feature.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
