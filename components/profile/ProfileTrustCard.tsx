export default function ProfileTrustCard({
  score,
  level,
}: {
  score: number;
  level: string;
}) {
  return (
    <div className="bg-white p-6 border-l-4 border-indigo-700 shadow-sm space-y-6">
      <h3 className="font-black text-slate-900 uppercase tracking-widest text-sm">
        Reputation
      </h3>
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-slate-50 rounded-xl text-center">
          <p className="text-2xl font-black text-indigo-600">
            {score || "0.0"}
          </p>
          <p className="text-[10px] font-bold text-slate-400 uppercase">
            Trust Score
          </p>
        </div>
        <div className="p-4 bg-indigo-50 rounded-xl text-center border border-indigo-100">
          <p className="text-xs font-black text-indigo-700 uppercase tracking-tighter">
            {level || "Newbie"}
          </p>
          <p className="text-[10px] font-bold text-indigo-400 uppercase">
            Badge
          </p>
        </div>
      </div>
    </div>
  );
}
