import React from "react";

const Hero = () => {
  return (
    /* UPDATED: text-slate-900 for dark text on light background, bg-slate-50 for neutral base */
    <section className="relative pt-20 min-h-[calc(100vh-80px)] flex items-center justify-center text-slate-900 bg-slate-50 overflow-hidden">
      {/* Background - Stays absolute to the container */}
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover opacity-30"
        >
          <source src="/hero-network.mp4" type="video/mp4" />
        </video>
        {/* UPDATED: Gradient overlay changed from dark slate to soft light slate/white */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-100/80 via-white/40 to-slate-100/80" />
      </div>

      <div className="relative z-10 container mx-auto px-6 py-20 text-center">
        {/* UPDATED: text-slate-900 and text-indigo-600 for the accent */}
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 leading-tight text-slate-900">
          Swap. Trade. <span className="text-indigo-600">Thrive.</span>
        </h1>
        {/* UPDATED: text-slate-600 for softer subtext */}
        <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed">
          The smart bartering platform where your items are your currency. Trade
          goods and services securely without spending a dime.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          {/* UPDATED: Indigo branding instead of bright blue */}
          <button className="w-full sm:w-auto bg-indigo-600 text-white hover:bg-indigo-700 px-8 py-4 rounded-full font-bold transition-all transform hover:scale-105 active:scale-95 shadow-lg shadow-indigo-500/20">
            Start Bartering
          </button>
          {/* UPDATED: Secondary button uses white/slate theme */}
          <button className="w-full sm:w-auto bg-white border border-slate-300 text-slate-700 px-8 py-4 rounded-full font-bold hover:bg-slate-50 transition-all backdrop-blur-sm shadow-sm">
            Explore Listings
          </button>
        </div>
      </div>
    </section>
  );
};

export default Hero;
