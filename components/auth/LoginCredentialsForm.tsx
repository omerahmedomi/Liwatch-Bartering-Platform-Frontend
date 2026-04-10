import { ArrowRight, Mail } from "lucide-react";

import ErrorDisplay from "@/components/ErrorDisplay";

import AuthPasswordField from "./AuthPasswordField";
import AuthTextInputField from "./AuthTextInputField";
import { AuthFormData, AuthMode } from "./auth.types";

type Props = {
  errorMessage: string | null;
  formData: AuthFormData;
  isLoading: boolean;
  primaryCta: string;
  showPassword: boolean;
  onClearError: () => void;
  onInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onModeChange: (mode: AuthMode) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onTogglePassword: () => void;
};

export default function LoginCredentialsForm({
  errorMessage,
  formData,
  isLoading,
  primaryCta,
  showPassword,
  onClearError,
  onInputChange,
  onModeChange,
  onSubmit,
  onTogglePassword,
}: Props) {
  return (
    <form onSubmit={onSubmit} className="space-y-5">
      {errorMessage && (
        <ErrorDisplay
          clearError={onClearError}
          errorMessage={errorMessage}
        />
      )}

      <AuthTextInputField
        name="email"
        type="email"
        value={formData.email}
        autoComplete="email"
        placeholder="you@example.com"
        label="Email"
        icon={Mail}
        onChange={onInputChange}
      />

      <AuthPasswordField
        name="password"
        value={formData.password}
        autoComplete="current-password"
        placeholder="Enter your password"
        label="Password"
        showPassword={showPassword}
        onToggleVisibility={onTogglePassword}
        onChange={onInputChange}
      />

      <div className="flex items-center gap-4 justify-end">
        <a
          href="#"
          className="text-sm font-semibold text-indigo-700 hover:text-indigo-800"
        >
          Forgot password?
        </a>
      </div>

      <button
        type="submit"
        className="w-full bg-indigo-600 text-white px-8 py-3 rounded-full font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-500/20 transition-all cursor-pointer disabled:cursor-not-allowed disabled:hover:bg-none disabled:bg-gray-400"
        disabled={isLoading}
      >
        {isLoading ? (
          "Authenticating..."
        ) : (
          <span className="flex items-center">
            {primaryCta} <ArrowRight size={18} />
          </span>
        )}
      </button>

      <div className="pt-2 text-center text-sm text-slate-600">
        Don&apos;t have an account?{" "}
        <button
          type="button"
          onClick={() => onModeChange("signup")}
          className="font-bold text-indigo-700 hover:text-indigo-800 cursor-pointer"
        >
          Sign up
        </button>
      </div>
    </form>
  );
}
