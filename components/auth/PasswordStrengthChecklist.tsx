import { PasswordCriterion } from "./auth.types";

type Props = {
  criteria: PasswordCriterion[];
};

export default function PasswordStrengthChecklist({ criteria }: Props) {
  return (
    <div className="mt-3 p-4 bg-slate-50 border border-slate-200 rounded-2xl animate-in fade-in slide-in-from-top-1 duration-300">
      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
        Password Requirements
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {criteria.map((criterion) => (
          <div key={criterion.label} className="flex items-center gap-2">
            <div
              className={`size-1.5 rounded-full transition-colors duration-300 ${
                criterion.met ? "bg-emerald-500" : "bg-slate-300"
              }`}
            />
            <span
              className={`text-xs transition-colors duration-300 ${
                criterion.met ? "text-emerald-700 font-medium" : "text-slate-400"
              }`}
            >
              {criterion.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
