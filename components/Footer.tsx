export default function Footer() {
  return (
    <footer className="bg-slate-950 border-t border-white/10 py-12">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="text-white font-bold text-xl italic">Liwatch</div>
        <div className="flex gap-8 text-slate-500 text-sm">
          <a href="#" className="hover:text-white transition-colors">
            Privacy
          </a>
          <a href="#" className="hover:text-white transition-colors">
            Terms
          </a>
          <a href="#" className="hover:text-white transition-colors">
            Discord
          </a>
        </div>
        <div className="text-slate-500 text-sm">
          © 2026 Liwatch Inc. All rights swapped.
        </div>
      </div>
    </footer>
  );
}
