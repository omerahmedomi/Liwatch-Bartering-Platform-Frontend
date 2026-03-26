"use client";

import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

export default function AuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const hasProcessed = useRef(false);

  useEffect(() => {
    // 1. Get the token
    const token = searchParams.get("token");

    if (token && !hasProcessed.current) {
      hasProcessed.current = true; // Block double-runs

      // 2. Save to storage
      localStorage.setItem("liwatch_token", token);

      // 3. Trigger the toast FIRST
      toast.success("Signed in successfully!", {
        description: "Welcome back to the Liwatch platform.",
      });

      // 4. DELAY the redirect slightly (300ms - 500ms)
      // This gives the toast time to mount and stay visible during the transition
      setTimeout(() => {
        router.replace("/");
      }, 500);
    } else if (!token && !hasProcessed.current) {
      hasProcessed.current = true;
      toast.error("Session expired or invalid token");
      router.replace("/auth?mode=login");
    }
  }, [router, searchParams]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
      <div className="animate-pulse flex flex-col items-center">
        <div className="size-12 bg-indigo-100 rounded-full mb-4 flex items-center justify-center">
          <div className="size-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        </div>
        <p className="text-slate-500 font-medium text-sm italic">
          Finalizing secure login...
        </p>
      </div>
    </div>
  );
}
