import Link from "next/link";
import { Plus, Package } from "lucide-react";

export default function UserHomePage() {
  return (
    <main className="pt-24 pb-16 min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-6">
        {/* --- Header Section --- */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">
              Welcome back,{" "}
              <span className="text-indigo-600 italic">Trader.</span>
            </h1>
            <p className="text-slate-500 font-medium">
              What would you like to swap today?
            </p>
          </div>

          <Link
            href="/create-post"
            className="flex items-center justify-center gap-2 bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-500/20 active:scale-95"
          >
            <Plus size={20} strokeWidth={3} />
            Post an Item/ a Service
          </Link>
        </div>

        {/* --- Empty State (If no posts exist yet) --- */}
        <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-slate-200 rounded-[3rem] bg-white/50">
          <div className="size-16 rounded-3xl bg-indigo-50 flex items-center justify-center text-indigo-500 mb-4">
            <Package size={32} />
          </div>
          <p className="text-slate-900 font-bold text-lg">
            Your inventory is empty
          </p>
          <p className="text-slate-500 text-sm mb-6">
            List your first item to start bartering with the community.
          </p>
        </div>
      </div>
    </main>
  );
}
