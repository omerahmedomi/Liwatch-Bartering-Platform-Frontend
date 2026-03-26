"use client";

import { useEffect, useEffectEvent, useState } from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import HowItWorks from "@/components/HowItWorks";
import Footer from "@/components/Footer";
import UserHomePage from "@/components/homepage/UserHomePage";
import { isTokenValid } from "@/lib/auth";

export default function HomePage() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    // check token existence and validity
    const isValid = isTokenValid();
    setIsLoggedIn(isValid);
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
