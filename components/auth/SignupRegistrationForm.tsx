import { ArrowRight, Mail, User } from "lucide-react";

import ErrorDisplay from "@/components/ErrorDisplay";

import AuthPasswordField from "./AuthPasswordField";
import AuthTextInputField from "./AuthTextInputField";
import PasswordStrengthChecklist from "./PasswordStrengthChecklist";
import {
  AuthFormData,
  AuthMode,
  PasswordCriterion,
} from "./auth.types";

type Props = {
  errorMessage: string | null;
  formData: AuthFormData;
  isLoading: boolean;
  isPasswordStrong: boolean;
  passwordCriteria: PasswordCriterion[];
  primaryCta: string;
  showConfirmPassword: boolean;
  showPassword: boolean;
  onClearError: () => void;
  onInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onModeChange: (mode: AuthMode) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onToggleConfirmPassword: () => void;
  onTogglePassword: () => void;
};

export default function SignupRegistrationForm({
  errorMessage,
  formData,
  isLoading,
  isPasswordStrong,
  passwordCriteria,
  primaryCta,
  showConfirmPassword,
  showPassword,
  onClearError,
  onInputChange,
  onModeChange,
  onSubmit,
  onToggleConfirmPassword,
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
        name="fullName"
        type="text"
        value={formData.fullName}
        autoComplete="name"
        placeholder="John Doe"
        label="Full name"
        icon={User}
        onChange={onInputChange}
      />

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

      <div>
        <AuthPasswordField
          name="password"
          value={formData.password}
          autoComplete="new-password"
          placeholder="Create a password"
          label="Password"
          showPassword={showPassword}
          onToggleVisibility={onTogglePassword}
          onChange={onInputChange}
        />
        {formData.password.length > 0 && (
          <PasswordStrengthChecklist criteria={passwordCriteria} />
        )}
      </div>

      <AuthPasswordField
        name="confirmPassword"
        value={formData.confirmPassword}
        autoComplete="new-password"
        placeholder="Re-enter your password"
        label="Confirm password"
        showPassword={showConfirmPassword}
        onToggleVisibility={onToggleConfirmPassword}
        onChange={onInputChange}
      />

      <button
        type="submit"
        className="w-full bg-indigo-600 text-white px-8 py-3 rounded-full font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-500/20 transition-all cursor-pointer disabled:cursor-not-allowed disabled:hover:bg-none disabled:bg-gray-400"
        disabled={isLoading || !isPasswordStrong}
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
        Already have an account?{" "}
        <button
          type="button"
          onClick={() => onModeChange("login")}
          className="font-bold text-indigo-700 hover:text-indigo-800 cursor-pointer"
        >
          Log in
        </button>
      </div>

      <p className="text-xs leading-relaxed text-slate-500">
        By continuing, you agree to our Terms and acknowledge our Privacy
        Policy.
      </p>
    </form>
  );
}
