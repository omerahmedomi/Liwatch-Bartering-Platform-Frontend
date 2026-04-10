import type { LucideIcon } from "lucide-react";

type Props = {
  autoComplete: string;
  icon: LucideIcon;
  label: string;
  name: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  type: string;
  value: string;
};

export default function AuthTextInputField({
  autoComplete,
  icon: Icon,
  label,
  name,
  onChange,
  placeholder,
  type,
  value,
}: Props) {
  return (
    <div>
      <label className="block text-sm font-semibold text-slate-700 mb-2">
        {label}
      </label>
      <div className="relative">
        <Icon
          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          size={18}
        />
        <input
          name={name}
          type={type}
          value={value}
          required
          autoComplete={autoComplete}
          placeholder={placeholder}
          className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 bg-white outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 text-slate-900 placeholder:text-slate-400"
          onChange={onChange}
        />
      </div>
    </div>
  );
}
