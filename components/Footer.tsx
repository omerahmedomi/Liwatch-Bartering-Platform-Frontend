export default function Footer() {
  return (
    <footer className="bg-slate-900 border-t border-slate-800 py-12">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="text-white font-bold text-xl italic tracking-tight">
          Liwatch
        </div>
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
        <div className="text-slate-500 text-sm">
          © {new Date().getFullYear()} Liwatch Inc. All rights swapped.
        </div>
      </div>
    </footer>
  );
}
