"use client";

import { useEffect, useMemo, useState } from "react";

import { useRouter, useSearchParams } from "next/navigation";

import api from "@/lib/axios";
import { getErrorMessage } from "@/lib/error";
import { toast } from "sonner";

import AuthBrandPanel from "@/components/auth/AuthBrandPanel";
import AuthModeToggle from "@/components/auth/AuthModeToggle";
import GoogleSignInButton from "@/components/auth/GoogleSignInButton";
import LoginCredentialsForm from "@/components/auth/LoginCredentialsForm";
import SignupRegistrationForm from "@/components/auth/SignupRegistrationForm";
import { AuthFormData, AuthMode } from "@/components/auth/auth.types";

const googleOAuthUrl = "http://localhost:8080/oauth2/authorization/google";

export default function AuthPage() {
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

  const primaryCta = useMemo(() => {
    return mode === "login" ? "Log in to your account" : "Create your account";
  }, [mode]);

  const switchMode = (nextMode: AuthMode) => {
    setMode(nextMode);
    setLoginErrorMessage(null);
    setRegistrationErrorMessage(null);
    router.replace(`/auth?mode=${nextMode}`, { scroll: false });
  };

  const clearCurrentError = () => {
    if (mode === "signup") {
      setRegistrationErrorMessage(null);
      return;
    }

    setLoginErrorMessage(null);
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
    <div className="bg-slate-50">
      <main className="pt-18 pb-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-10 items-stretch">
            <AuthBrandPanel />

            <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-lg shadow-indigo-500/5">
              <div className="mb-8">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h1 className="text-3xl font-extrabold text-slate-900">
                      {mode === "login" ? "Welcome back" : "Create account"}
                    </h1>
                    <p className="text-slate-600 mt-2">
                      {mode === "login"
                        ? "Log in to continue bartering."
                        : "Join Liwatch in under a minute."}
                    </p>
                  </div>

                  <div className="hidden sm:block">
                    <AuthModeToggle mode={mode} onChange={switchMode} />
                  </div>
                </div>
              </div>

              <div className="sm:hidden mb-6">
                <AuthModeToggle mode={mode} onChange={switchMode} fullWidth />
              </div>

              <GoogleSignInButton href={googleOAuthUrl} />

              <div className="relative mb-8 text-center">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-slate-200"></span>
                </div>
                <span className="relative bg-white px-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                  Or use your email
                </span>
              </div>

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
                />
              ) : (
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
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
