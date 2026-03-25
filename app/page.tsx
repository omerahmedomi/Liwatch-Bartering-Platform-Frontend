"use client";

import { useEffect, useEffectEvent, useState } from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import HowItWorks from "@/components/HowItWorks";
import Footer from "@/components/Footer";
import UserHomePage from "@/components/homepage/UserHomePage";

export default function HomePage() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  const setAuthState = useEffectEvent((token:string | null)=>{
    setIsLoggedIn(!!token)
  })

  useEffect(() => {
    // Check if token exists in browser storage
    const token = localStorage.getItem("liwatch_token");
    setAuthState(token); // true if token exists, false otherwise
  }, []);

  // to prevent some flickering
  if (isLoggedIn === null) {
    return <div className="min-h-screen bg-slate-50" />;
  }

  return (
    <>
      <Navbar isLoggedIn={isLoggedIn} />

      {isLoggedIn ? (
        // View for logged in user
       <UserHomePage/>
      ) : (
       // View for guest user
        <main>
          <Hero />
          <Features />
          <HowItWorks />
        </main>
      )}

      <Footer />
    </>
  );
}
