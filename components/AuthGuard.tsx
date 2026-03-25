"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("liwatch_token");

    if (!token) {
      // 1. Not logged in? Send to signup
      router.push("/auth?mode=signup");
    } else {
      // 2. Logged in? Allow them to see the page
      setIsChecking(false);
    }
  }, [router]);

  if (isChecking) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
        <Loader2 className="animate-spin text-indigo-600 mb-4" size={40} />
        <p className="text-slate-600 font-medium tracking-tight">
          Verifying your session...
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
