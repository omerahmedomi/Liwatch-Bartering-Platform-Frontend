import { Eye, EyeOff, Lock } from "lucide-react";

type Props = {
  autoComplete: string;
  label: string;
  name: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onToggleVisibility: () => void;
  placeholder: string;
  showPassword: boolean;
  value: string;
};

export default function AuthPasswordField({
  autoComplete,
  label,
  name,
  onChange,
  onToggleVisibility,
  placeholder,
  showPassword,
  value,
}: Props) {
  return (
    <div>
      <label className="block text-sm font-semibold text-slate-700 mb-2">
        {label}
      </label>
      <div className="relative">
        <Lock
          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          size={18}
        />
        <input
          name={name}
          value={value}
          type={showPassword ? "text" : "password"}
          required
          autoComplete={autoComplete}
          placeholder={placeholder}
          className="w-full pl-11 pr-11 py-3 rounded-2xl border border-slate-200 bg-white outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 text-slate-900 placeholder:text-slate-400"
          onChange={onChange}
        />
        <button
          type="button"
          onClick={onToggleVisibility}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
    </div>
  );
}
