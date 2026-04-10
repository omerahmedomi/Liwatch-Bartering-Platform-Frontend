const trustHighlights = [
  {
    title: "Verified users",
    description: "Reduce fraud with trusted profiles.",
  },
  {
    title: "Secure exchanges",
    description: "Escrow-style flow for confidence.",
  },
  {
    title: "Fast communication",
    description: "Negotiate terms in real time.",
  },
];

export default function AuthBrandPanel() {
  return (
    <div className="hidden lg:flex flex-col justify-center p-10 rounded-3xl bg-white border border-slate-200 shadow-lg shadow-indigo-500/5">
      <div className="flex items-center gap-3">
        <div className="bg-indigo-600 p-px size-10 rounded-full">
          <img
            src="/liwatch-logo.png"
            alt="LIWATCH logo"
            className="w-full h-full rounded-full"
          />
        </div>
        <div>
          <div className="text-2xl font-black text-slate-900 tracking-tighter italic">
            LIWATCH
          </div>
          <div className="text-sm font-semibold text-slate-600">
            Trade goods. Build trust.
          </div>
        </div>
      </div>

      <div className="mt-8">
        <div className="text-slate-900 text-3xl font-extrabold leading-tight">
          Swap. Trade. <span className="text-indigo-600">Thrive.</span>
        </div>
        <p className="mt-4 text-slate-600 leading-relaxed">
          Secure exchanges, real-time chat, and a community built on verified
          profiles.
        </p>
      </div>

      <div className="mt-8 space-y-4">
        {trustHighlights.map((highlight) => (
          <div
            key={highlight.title}
            className="flex items-start gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200"
          >
            <div className="mt-1 size-2 rounded-full bg-indigo-600" />
            <div>
              <div className="font-bold text-slate-900">{highlight.title}</div>
              <div className="text-slate-600 text-sm mt-1">
                {highlight.description}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 flex items-center gap-3">
        <div className="px-4 py-2 rounded-full bg-indigo-50 text-indigo-700 font-bold text-sm border border-indigo-200">
          New here?
        </div>
        <div className="text-sm text-slate-600">Switch to Signup anytime.</div>
      </div>
    </div>
  );
}
