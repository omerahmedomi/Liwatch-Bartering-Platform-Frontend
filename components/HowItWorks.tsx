"use client";

import React from "react";
import { motion } from "framer-motion";
import { UserPlus, Package, MessageCircle, Handshake } from "lucide-react";

const steps = [
  {
    id: 1,
    title: "Create Account",
    desc: "Sign up in seconds and set up your profile to start your bartering journey.",
    icon: <UserPlus className="w-6 h-6" />,
    color: "bg-blue-500",
  },
  {
    id: 2,
    title: "List Your Items",
    desc: "Post what you have to offer with photos, descriptions, and what you are looking for.",
    icon: <Package className="w-6 h-6" />,
    color: "bg-emerald-500",
  },
  {
    id: 3,
    title: "Connect & Negotiate",
    desc: "Find matches, chat with other users, and negotiate the perfect exchange.",
    icon: <MessageCircle className="w-6 h-6" />,
    color: "bg-purple-500",
  },
  {
    id: 4,
    title: "Complete Trade",
    desc: "Finalize your exchange with our secure digital agreement and rating system.",
    icon: <Handshake className="text-white w-6 h-6" />,
    color: "bg-orange-500",
  },
];

export default function HowItWorks() {
  return (
    <section className="py-24 bg-slate-950 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-20">
          <motion.h4
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="text-blue-500 font-bold tracking-[0.2em] uppercase text-sm mb-4"
          >
            How It Works
          </motion.h4>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-black text-white mb-6"
          >
            Start Trading in 4 Simple Steps
          </motion.h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Join thousands of users already exchanging goods and services on
            Liwatch.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="relative grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Connecting Line (Desktop Only) */}
          <div className="hidden lg:block absolute top-12 left-0 w-full h-[2px] bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-orange-500/20 z-0" />

          {steps.map((step, index) => (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2 }}
              className="relative z-10 flex flex-col items-center text-center group"
            >
              {/* Step Number & Icon Circle */}
              <div
                className={`w-24 h-24 rounded-3xl ${step.color} flex items-center justify-center mb-8 relative shadow-2xl group-hover:scale-110 transition-transform duration-500`}
              >
                <div className="absolute -top-4 -right-4 w-10 h-10 bg-slate-900 border-2 border-white/10 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  {step.id}
                </div>
                <div className="text-white">{step.icon}</div>
              </div>

              {/* Text Content */}
              <h3 className="text-xl font-bold text-white mb-4 group-hover:text-blue-400 transition-colors">
                {step.title}
              </h3>
              <p className="text-slate-400 leading-relaxed text-sm">
                {step.desc}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA for Guests */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="mt-20 text-center"
        >
          <button className="bg-white text-slate-950 px-10 py-4 rounded-full font-bold hover:bg-blue-50 transition-all transform hover:-translate-y-1">
            Create Your Free Account
          </button>
        </motion.div>
      </div>
    </section>
  );
}
