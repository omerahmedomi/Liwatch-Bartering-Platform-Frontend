export default function Footer() {
  return (
    /* UPDATED: bg-slate-900 (Deep Slate) instead of 950, and border-slate-200 for a clean line */
    <footer className="bg-slate-900 border-t border-slate-800 py-12">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
        {/* UPDATED: text-white for the logo to pop against the slate-900 */}
        <div className="text-white font-bold text-xl italic tracking-tight">
          Liwatch
        </div>

        {/* UPDATED: text-slate-400 with indigo hover colors */}
        <div className="flex gap-8 text-slate-400 text-sm font-medium">
          <a href="#" className="hover:text-indigo-400 transition-colors">
            Privacy
          </a>
          <a href="#" className="hover:text-indigo-400 transition-colors">
            Terms
          </a>
          <a href="#" className="hover:text-indigo-400 transition-colors">
            Discord
          </a>
        </div>

        {/* UPDATED: text-slate-500 */}
        <div className="text-slate-500 text-sm">
          © 2026 Liwatch Inc. All rights swapped.
        </div>
      </div>
    </footer>
  );
}
