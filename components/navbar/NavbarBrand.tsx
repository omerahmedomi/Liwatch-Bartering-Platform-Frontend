import Link from "next/link";

export default function NavbarBrand() {
  return (
    <Link
      href="/"
      className="flex items-center gap-2 group cursor-pointer"
      aria-label="Go to home"
    >
      <div className="bg-indigo-600 p-px size-10 rounded-full group-hover:rotate-12 transition-transform">
        <img
          src="/liwatch-logo.png"
          className="w-full max-w-full rounded-full"
          alt="Logo"
        />
      </div>
      <span className="text-2xl font-black text-slate-900 tracking-tighter italic">
        LIWATCH
      </span>
    </Link>
  );
}
