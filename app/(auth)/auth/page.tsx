"use client";

import { useEffect, useMemo, useState } from "react";

import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";

import api from "@/lib/axios";
import { getErrorMessage } from "@/lib/error";
import { toast } from "sonner";

import AuthBrandPanel from "@/components/auth/AuthBrandPanel";
import AuthModeToggle from "@/components/auth/AuthModeToggle";
import GoogleSignInButton from "@/components/auth/GoogleSignInButton";
import LoginCredentialsForm from "@/components/auth/LoginCredentialsForm";
import SignupRegistrationForm from "@/components/auth/SignupRegistrationForm";
import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm";
import { AuthFormData, AuthMode } from "@/components/auth/auth.types";

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_BASE_URL || "http://localhost:8080";
const googleOAuthUrl = `${backendUrl}/oauth2/authorization/google`;

export function AuthPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const modeParam = searchParams.get("mode");
  const initialMode: AuthMode = modeParam === "signup" ? "signup" : "login";

  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [registrationErrorMessage, setRegistrationErrorMessage] = useState<
    string | null
  >(null);
  const [loginErrorMessage, setLoginErrorMessage] = useState<string | null>(
    null,
  );
  const [forgotErrorMessage, setForgotErrorMessage] = useState<string | null>(
    null,
  );
  const [formData, setFormData] = useState<AuthFormData>({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const passwordCriteria = useMemo(() => {
    const password = formData.password;
    return [
      { label: "At least 8 characters", met: password.length >= 8 },
      { label: "At least one number", met: /\d/.test(password) },
      {
        label: "At least one special character (@$!%*?)",
        met: /[@$!%*?&]/.test(password),
      },
      { label: "At least one uppercase letter", met: /[A-Z]/.test(password) },
    ];
  }, [formData.password]);

  const isPasswordStrong = passwordCriteria.every((criterion) => criterion.met);

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  useEffect(() => {
    const errorParam = searchParams.get("error");
    if (errorParam === "suspended") {
      setLoginErrorMessage("Your account has been suspended by an administrator.");
    }
  }, [searchParams]);

  const primaryCta = useMemo(() => {
    return mode === "login" ? "Log in to your account" : "Create your account";
  }, [mode]);

  const switchMode = (nextMode: AuthMode) => {
    setMode(nextMode);
    setLoginErrorMessage(null);
    setRegistrationErrorMessage(null);
    setForgotErrorMessage(null);
    router.replace(`/auth?mode=${nextMode}`, { scroll: false });
  };

  const clearCurrentError = () => {
    if (mode === "signup") {
      setRegistrationErrorMessage(null);
      return;
    }
    if (mode === "forgot") {
      setForgotErrorMessage(null);
      return;
    }

    setLoginErrorMessage(null);
  };

  const handleForgotPasswordSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setForgotErrorMessage(null);

    try {
      await api.post(`/api/auth/forgot-password?email=${encodeURIComponent(formData.email)}`);
      toast.success("Reset link sent!", {
        description: `Check ${formData.email} for password reset instructions.`,
        duration: 5000,
      });
      switchMode("login");
    } catch (error: unknown) {
      console.log(error);
      const message = getErrorMessage(error);
      setForgotErrorMessage(
        typeof message === "string" ? message : "Failed to send reset link"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    clearCurrentError();
    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (mode === "signup" && !isPasswordStrong) {
      return;
    }

    setIsLoading(true);
    clearCurrentError();

    try {
      if (mode === "signup") {
        if (formData.password !== formData.confirmPassword) {
          throw new Error("Passwords do not match");
        }

        await api.post("/api/auth/register", {
          fullName: formData.fullName,
          email: formData.email,
          password: formData.password,
        });

        toast.success("Verification email sent!", {
          description: `Check ${formData.email} to activate your account.`,
          duration: 5000,
        });
        switchMode("login");
      } else {
        const response = await api.post("/api/auth/login", {
          email: formData.email,
          password: formData.password,
        });

        const { token } = response.data;
        localStorage.setItem("liwatch_token", token);
        router.push("/");
      }
    } catch (error: unknown) {
      console.log(error);
      const message = getErrorMessage(error);

      if (mode === "signup") {
        setRegistrationErrorMessage(
          typeof message === "string" ? message : "Authentication failed",
        );
      } else {
        setLoginErrorMessage(
          typeof message === "string" ? message : "Authentication failed",
        );
      }
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

            <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg shadow-indigo-500/5">
              <div className="mb-8">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100">
                      {mode === "login"
                        ? "Welcome back"
                        : mode === "signup"
                        ? "Create account"
                        : "Reset Password"}
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-2">
                      {mode === "login"
                        ? "Log in to continue bartering."
                        : mode === "signup"
                        ? "Join Liwatch in under a minute."
                        : "Enter your email to receive a password reset link."}
                    </p>
                  </div>

                  {mode !== "forgot" && (
                    <div className="hidden sm:block">
                      <AuthModeToggle mode={mode} onChange={switchMode} />
                    </div>
                  )}
                </div>
              </div>

              {mode !== "forgot" && (
                <div className="sm:hidden mb-6">
                  <AuthModeToggle mode={mode} onChange={switchMode} fullWidth />
                </div>
              )}

              {mode !== "forgot" && <GoogleSignInButton href={googleOAuthUrl} />}

              {mode !== "forgot" && (
                <div className="relative mb-8 text-center">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-slate-200 dark:border-slate-800"></span>
                  </div>
                  <span className="relative bg-white dark:bg-slate-900 px-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                    Or use your email
                  </span>
                </div>
              )}

              {mode === "login" ? (
                <LoginCredentialsForm
                  errorMessage={loginErrorMessage}
                  formData={formData}
                  isLoading={isLoading}
                  primaryCta={primaryCta}
                  showPassword={showPassword}
                  onClearError={clearCurrentError}
                  onInputChange={handleInputChange}
                  onModeChange={switchMode}
                  onSubmit={handleSubmit}
                  onTogglePassword={() => setShowPassword((current) => !current)}
                  onForgotPasswordClick={() => switchMode("forgot")}
                />
              ) : mode === "signup" ? (
                <SignupRegistrationForm
                  errorMessage={registrationErrorMessage}
                  formData={formData}
                  isLoading={isLoading}
                  isPasswordStrong={isPasswordStrong}
                  passwordCriteria={passwordCriteria}
                  primaryCta={primaryCta}
                  showConfirmPassword={showConfirmPassword}
                  showPassword={showPassword}
                  onClearError={clearCurrentError}
                  onInputChange={handleInputChange}
                  onModeChange={switchMode}
                  onSubmit={handleSubmit}
                  onToggleConfirmPassword={() =>
                    setShowConfirmPassword((current) => !current)
                  }
                  onTogglePassword={() => setShowPassword((current) => !current)}
                />
              ) : (
                <ForgotPasswordForm
                  errorMessage={forgotErrorMessage}
                  email={formData.email}
                  isLoading={isLoading}
                  onClearError={clearCurrentError}
                  onEmailChange={handleInputChange}
                  onModeChange={switchMode}
                  onSubmit={handleForgotPasswordSubmit}
                />
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

import { Suspense } from "react";
export default function AuthPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-indigo-600" /></div>}>
      <AuthPageContent />
    </Suspense>
  );
}
