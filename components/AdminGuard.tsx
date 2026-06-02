"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { isTokenValid } from "@/lib/auth";
import api from "@/lib/axios";

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!isTokenValid()) {
      router.push("/auth?mode=login");
      return;
    }

    const verifyAdmin = async () => {
      try {
        const response = await api.get("/api/profile/me");
        const role = response.data?.user?.role;
        console.log("AdminGuard fetched role:", role, "Full response:", response.data);
        if (role === "ADMIN") {
          setIsAdmin(true);
          setIsChecking(false);
        } else {
          router.push("/listings");
        }
      } catch (error) {
        console.error("Failed to verify admin status:", error);
        router.push("/listings");
      }
    };

    verifyAdmin();
  }, [router]);

  if (isChecking) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-100">
        <Loader2 className="animate-spin text-indigo-500 mb-4" size={40} />
        <p className="text-slate-400 font-medium tracking-tight">
          Verifying administrator clearance...
        </p>
      </div>
    );
  }

  return isAdmin ? <>{children}</> : null;
}
