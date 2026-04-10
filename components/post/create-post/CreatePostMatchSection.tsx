import { Info } from "lucide-react";

type Props = {
  lookingFor: string;
  onChange: (value: string) => void;
};

export default function CreatePostMatchSection({
  lookingFor,
  onChange,
}: Props) {
  return (
    <section className="bg-indigo-900 p-8 rounded-[2.5rem] shadow-2xl shadow-indigo-200 text-white space-y-6">
      <header className="flex items-center gap-3">
        <div className="size-10 rounded-xl bg-white/10 flex items-center justify-center text-indigo-300">
          <Info size={20} />
        </div>
        <h2 className="text-xl font-black tracking-tight">3. Your Match</h2>
      </header>

      <div className="space-y-4">
        <label className="text-xs font-bold text-indigo-200/60 uppercase tracking-widest">
          I am looking for:
        </label>
        <input
          value={lookingFor}
          placeholder="What would you want in return?"
          className="w-full bg-transparent border-b-2 border-indigo-700 py-3 text-lg font-bold outline-none focus:border-indigo-400 transition-colors placeholder:text-indigo-300"
          onChange={(event) => onChange(event.target.value)}
        />
      </div>
    </section>
  );
}
