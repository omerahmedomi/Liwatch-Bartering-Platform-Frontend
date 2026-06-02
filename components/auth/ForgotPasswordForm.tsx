import { ArrowLeft, ArrowRight, Mail } from "lucide-react";
import ErrorDisplay from "@/components/ErrorDisplay";
import AuthTextInputField from "./AuthTextInputField";
import { AuthMode } from "./auth.types";

type Props = {
  errorMessage: string | null;
  email: string;
  isLoading: boolean;
  onClearError: () => void;
  onEmailChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onModeChange: (mode: AuthMode) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
};

export default function ForgotPasswordForm({
  errorMessage,
  email,
  isLoading,
  onClearError,
  onEmailChange,
  onModeChange,
  onSubmit,
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
        value={email}
        autoComplete="email"
        placeholder="you@example.com"
        label="Email"
        icon={Mail}
        onChange={onEmailChange}
      />

      <button
        type="submit"
        className="w-full bg-indigo-600 text-white px-8 py-3 rounded-full font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-500/20 transition-all cursor-pointer disabled:cursor-not-allowed disabled:hover:bg-none disabled:bg-gray-400"
        disabled={isLoading}
      >
        {isLoading ? (
          "Sending email..."
        ) : (
          <span className="flex items-center gap-2">
            Send Reset Link <ArrowRight size={18} />
          </span>
        )}
      </button>

      <div className="pt-2 text-center text-sm text-slate-600 dark:text-slate-400">
        <button
          type="button"
          onClick={() => onModeChange("login")}
          className="font-bold text-indigo-700 hover:text-indigo-800 cursor-pointer flex items-center gap-2 mx-auto"
        >
          <ArrowLeft size={16} /> Back to Login
        </button>
      </div>
    </form>
  );
}
