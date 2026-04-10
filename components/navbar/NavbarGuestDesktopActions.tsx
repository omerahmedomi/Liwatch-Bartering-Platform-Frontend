import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default function NavbarGuestDesktopActions() {
  return (
    <div className="hidden md:flex items-center gap-6">
      <Link
        href="/auth?mode=login"
        className="text-slate-700 font-semibold hover:text-indigo-600 transition-colors"
      >
        Log in
      </Link>
      <Link
        href="/auth?mode=signup"
        className="bg-indigo-600 text-white px-6 py-2.5 rounded-full font-bold flex items-center gap-2 hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-500/20 transition-all"
      >
        Join Platform <ArrowRight size={16} />
      </Link>
    </div>
  );
}
