import React from "react";
import Link from "next/link";

const Hero = () => {
  return (
    <section className="relative sm:mt-20 min-h-[calc(100vh-80px)] flex items-center justify-center text-slate-900 dark:text-slate-100 bg-slate-50 dark:bg-slate-950 overflow-hidden">
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover opacity-30"
        >
          <source
            src="https://www.pexels.com/download/video/7102266/"
            type="video/mp4"
          />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-slate-100/80 via-white/40 to-slate-100/80 dark:from-slate-950/80 dark:via-slate-900/60 dark:to-slate-950/80" />
      </div>

      <div className="relative z-10 container mx-auto px-6  text-center">
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 leading-tight text-slate-900 dark:text-slate-100">
          Swap. Trade. <span className="text-indigo-600">Thrive.</span>
        </h1>
        <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          The smart bartering platform where your items are your currency. Trade
          goods and services securely without spending a dime.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link href="/auth" className="w-full sm:w-auto">
            <button className="w-full sm:w-auto bg-indigo-600 text-white hover:bg-indigo-700 px-8 py-4 rounded-full font-bold transition-all transform hover:scale-105 active:scale-95 shadow-lg shadow-indigo-500/20">
              Start Bartering
            </button>
          </Link>
          <Link href="/auth" className="w-full sm:w-auto">
            <button className="w-full sm:w-auto bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 px-8 py-4 rounded-full font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all backdrop-blur-sm shadow-sm">
              Explore Listings
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Hero;
