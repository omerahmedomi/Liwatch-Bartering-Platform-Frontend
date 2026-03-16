import Features from "@/components/Features";
import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import HowItWorks from "@/components/HowItWorks";
import Navbar from "@/components/Navbar";

export default function Home() {
  return (
    <div>
      <Navbar/>
      <Hero/>
      <Features/>
      <HowItWorks/>
      <Footer/>
    </div>
  );
}
