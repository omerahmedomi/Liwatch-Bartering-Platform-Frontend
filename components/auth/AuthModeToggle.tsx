import { AuthMode } from "./auth.types";

type Props = {
  mode: AuthMode;
  fullWidth?: boolean;
  onChange: (mode: AuthMode) => void;
};

export default function AuthModeToggle({
  mode,
  fullWidth = false,
  onChange,
}: Props) {
  const buttonBaseClass = fullWidth
    ? "flex-1 px-5 py-2 rounded-full text-sm font-bold transition-all"
    : "px-5 py-2 rounded-full text-sm font-bold transition-all";

  return (
    <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-full border border-slate-200 dark:border-slate-800">
      <div className="flex">
        {(["login", "signup"] as const).map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            className={`${buttonBaseClass} ${
              mode === option
                ? "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 cursor-pointer"
            }`}
          >
            {option === "login" ? "Login" : "Signup"}
          </button>
        ))}
      </div>
    </div>
  );
}
