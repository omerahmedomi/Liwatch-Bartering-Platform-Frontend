import React from "react";

const Hero = () => {
  return (
    /* CHANGE: Changed h-[90vh] to min-h-[calc(100vh-80px)] 
       CHANGE: Added mt-20 to push the whole section below the 80px navbar
    */
    <section className="relative pt-20 min-h-[calc(100vh-80px)] flex items-center justify-center text-white overflow-hidden">
      {/* Background - Stays absolute to the container */}
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover opacity-40"
        >
          <source src="/hero-network.mp4" type="video/mp4" />
        </video>
        {/* Gradient overlay ensures text remains readable */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900/80 to-slate-950" />
      </div>

      <div className="relative z-10 container mx-auto px-6 py-20 text-center">
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 leading-tight">
          Swap. Trade. <span className="text-blue-500">Thrive.</span>
        </h1>
        <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed">
          The smart bartering platform where your items are your currency. Trade
          goods and services securely without spending a dime.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 px-8 py-4 rounded-full font-bold transition-all transform hover:scale-105 active:scale-95 shadow-lg shadow-blue-500/20">
            Start Bartering
          </button>
          <button className="w-full sm:w-auto bg-white/5 border border-white/20 px-8 py-4 rounded-full font-bold hover:bg-white/10 transition-all backdrop-blur-sm">
            Explore Listings
          </button>
        </div>
      </div>
    </section>
  );
};

export default Hero;
