"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/axios";
import { getErrorMessage } from "@/lib/error";
import AuthBrandPanel from "@/components/auth/AuthBrandPanel";
import AuthPasswordField from "@/components/auth/AuthPasswordField";
import PasswordStrengthChecklist from "@/components/auth/PasswordStrengthChecklist";
import Link from "next/link";

function ResetPasswordFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setErrorMessage("Reset token is missing from the link.");
    }
  }, [token]);

  const passwordCriteria = useMemo(() => {
    return [
      { label: "At least 8 characters", met: password.length >= 8 },
      { label: "At least one number", met: /\d/.test(password) },
      {
        label: "At least one special character (@$!%*?)",
        met: /[@$!%*?&]/.test(password),
      },
      { label: "At least one uppercase letter", met: /[A-Z]/.test(password) },
    ];
  }, [password]);

  const isPasswordStrong = passwordCriteria.every((criterion) => criterion.met);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token) {
      setErrorMessage("Reset token is missing.");
      return;
    }
    if (!isPasswordStrong) {
      setErrorMessage("Please meet all password requirements first.");
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      await api.post(`/api/auth/reset-password?token=${encodeURIComponent(token)}&newPassword=${encodeURIComponent(password)}`);
      toast.success("Password reset successful!", {
        description: "You can now log in with your new password.",
        duration: 5000,
      });
      router.push("/auth?mode=login");
    } catch (error: unknown) {
      console.log(error);
      const message = getErrorMessage(error);
      setErrorMessage(
        typeof message === "string" ? message : "Failed to reset password. The link may have expired."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-950">
      <main className="pt-18 pb-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-10 items-stretch">
            <AuthBrandPanel />

            <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg shadow-indigo-500/5 flex flex-col justify-center">
              <div className="mb-8">
                <h1 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100">
                  Reset Password
                </h1>
                <p className="text-slate-600 dark:text-slate-400 mt-2">
                  Enter a strong new password for your account.
                </p>
              </div>

              {errorMessage && (
                <div className="mb-6 p-4 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800 rounded-2xl text-sm font-semibold text-rose-700 dark:text-rose-400">
                  {errorMessage}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <AuthPasswordField
                    name="password"
                    value={password}
                    autoComplete="new-password"
                    placeholder="Create a password"
                    label="New Password"
                    showPassword={showPassword}
                    onToggleVisibility={() => setShowPassword((curr) => !curr)}
                    onChange={(e) => {
                      setErrorMessage(null);
                      setPassword(e.target.value);
                    }}
                  />
                  {password.length > 0 && (
                    <PasswordStrengthChecklist criteria={passwordCriteria} />
                  )}
                </div>

                <AuthPasswordField
                  name="confirmPassword"
                  value={confirmPassword}
                  autoComplete="new-password"
                  placeholder="Re-enter your password"
                  label="Confirm Password"
                  showPassword={showConfirmPassword}
                  onToggleVisibility={() => setShowConfirmPassword((curr) => !curr)}
                  onChange={(e) => {
                    setErrorMessage(null);
                    setConfirmPassword(e.target.value);
                  }}
                />

                <button
                  type="submit"
                  className="w-full bg-indigo-600 text-white px-8 py-3 rounded-full font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-500/20 transition-all cursor-pointer disabled:cursor-not-allowed disabled:hover:bg-none disabled:bg-gray-400"
                  disabled={isLoading || !isPasswordStrong || !token}
                >
                  {isLoading ? (
                    "Resetting..."
                  ) : (
                    <span className="flex items-center gap-2">
                      Reset Password <ArrowRight size={18} />
                    </span>
                  )}
                </button>

                <div className="pt-2 text-center text-sm text-slate-600 dark:text-slate-400">
                  <Link
                    href="/auth?mode=login"
                    className="font-bold text-indigo-700 hover:text-indigo-800 cursor-pointer flex items-center gap-2 mx-auto justify-center"
                  >
                    <ArrowLeft size={16} /> Back to Login
                  </Link>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
          <Loader2 className="animate-spin text-indigo-600" size={40} />
        </div>
      }
    >
      <ResetPasswordFormContent />
    </Suspense>
  );
}
