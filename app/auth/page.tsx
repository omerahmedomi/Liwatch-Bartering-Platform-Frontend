"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, Eye, EyeOff, Lock, Mail, User } from "lucide-react";

import api from "@/lib/axios";
import { X } from "lucide-react";
import ErrorDisplay from "@/components/ErrorDisplay";

type Mode = "login" | "signup";

export default function AuthPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const modeParam = searchParams.get("mode");
  const initialMode: Mode = modeParam === "signup" ? "signup" : "login";

  const [mode, setMode] = useState<Mode>(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [registrationErrorMessage, setRegistrationErrorMessage] = useState<
    string | null
  >(null);
  const [loginErrorMessage, setLoginErrorMessage] = useState<string | null>(
    null,
  );

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  // helper to check password strength
  const passwordCriteria = useMemo(() => {
    const pwd = formData.password;
    return [
      { label: "At least 8 characters", met: pwd.length >= 8 },
      { label: "At least one number", met: /\d/.test(pwd) },
      {
        label: "At least one special character (@$!%*?)",
        met: /[@$!%*?&]/.test(pwd),
      },
      { label: "At least one uppercase letter", met: /[A-Z]/.test(pwd) },
    ];
  }, [formData.password]);

  const isPasswordStrong = passwordCriteria.every((c) => c.met);
  useEffect(() => {
    // Keep the UI in sync with the query param
    setMode(initialMode);
  }, [initialMode]);

  const primaryCta = useMemo(() => {
    return mode === "login" ? "Log in to your account" : "Create your account";
  }, [mode]);

  function switchMode(nextMode: Mode) {
    setMode(nextMode);
    router.replace(`/auth?mode=${nextMode}`, { scroll: false });
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    if (mode === "signup" && !isPasswordStrong) return;
    if (mode === "signup") {
      setRegistrationErrorMessage(null);
    } else setLoginErrorMessage(null);

    try {
      if (mode === "signup") {
        // validation
        if (formData.password !== formData.confirmPassword) {
          throw new Error("Passwords do not match");
        }

        // register User
        const response = await api.post("/api/auth/register", {
          fullName: formData.fullName,
          email: formData.email,
          password: formData.password,
        });
        console.log(response.data);

        alert(
          "Registration successful! Please check your email for verification.",
        );
        switchMode("login");
      } else {
        // login user
        const response = await api.post("/api/auth/login", {
          email: formData.email,
          password: formData.password,
        });

        // backend returns {token,email}
        const { token } = response.data;
        localStorage.setItem("liwatch_token", token);

        // sucess redirect
        router.push("/");
      }
    } catch (err: any) {
      console.log(err);
      // Captures your Spring Boot error messages (e.g., "Please verify your email first")
      const message =
        err.response?.data || err.message || "An unexpected error occurred";
      if (mode === "signup")
        setRegistrationErrorMessage(
          typeof message === "string" ? message : "Authentication failed",
        );
      else
        setLoginErrorMessage(
          typeof message === "string" ? message : "Authentication failed",
        );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className=" bg-slate-50">
      {/* <Navbar /> */}

      <main className="pt-24 pb-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-10 items-stretch">
            {/* Left: brand / trust panel */}
            <div className="hidden lg:flex flex-col justify-center p-10 rounded-3xl bg-white border border-slate-200 shadow-lg shadow-indigo-500/5">
              <div className="flex items-center gap-3">
                <div className="bg-indigo-600 p-px size-10 rounded-full">
                  <img
                    src="/liwatch-logo.png"
                    alt="LIWATCH logo"
                    className="w-full h-full rounded-full"
                  />
                </div>
                <div>
                  <div className="text-2xl font-black text-slate-900 tracking-tighter italic">
                    LIWATCH
                  </div>
                  <div className="text-sm font-semibold text-slate-600">
                    Trade goods. Build trust.
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <div className="text-slate-900 text-3xl font-extrabold leading-tight">
                  Swap. Trade. <span className="text-indigo-600">Thrive.</span>
                </div>
                <p className="mt-4 text-slate-600 leading-relaxed">
                  Secure exchanges, real-time chat, and a community built on
                  verified profiles.
                </p>
              </div>

              <div className="mt-8 space-y-4">
                {[
                  {
                    title: "Verified users",
                    desc: "Reduce fraud with trusted profiles.",
                  },
                  {
                    title: "Secure exchanges",
                    desc: "Escrow-style flow for confidence.",
                  },
                  {
                    title: "Fast communication",
                    desc: "Negotiate terms in real time.",
                  },
                ].map((item) => (
                  <div
                    key={item.title}
                    className="flex items-start gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200"
                  >
                    <div className="mt-1 size-2 rounded-full bg-indigo-600" />
                    <div>
                      <div className="font-bold text-slate-900">
                        {item.title}
                      </div>
                      <div className="text-slate-600 text-sm mt-1">
                        {item.desc}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 flex items-center gap-3">
                <div className="px-4 py-2 rounded-full bg-indigo-50 text-indigo-700 font-bold text-sm border border-indigo-200">
                  New here?
                </div>
                <div className="text-sm text-slate-600">
                  Switch to Signup anytime.
                </div>
              </div>
            </div>

            {/* Right: auth card */}
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

                  <div className="hidden sm:block bg-slate-100 p-1 rounded-full border border-slate-200">
                    <div className="flex">
                      <button
                        type="button"
                        onClick={() => switchMode("login")}
                        className={`px-5 py-2 rounded-full text-sm font-bold  transition-all ${
                          mode === "login"
                            ? "bg-white border border-slate-200 text-slate-900 shadow-sm "
                            : "text-slate-600 hover:text-slate-900 cursor-pointer"
                        }`}
                      >
                        Login
                      </button>
                      <button
                        type="button"
                        onClick={() => switchMode("signup")}
                        className={`px-5 py-2 rounded-full text-sm font-bold transition-all ${
                          mode === "signup"
                            ? "bg-white border border-slate-200 text-slate-900 shadow-sm"
                            : "text-slate-600 hover:text-slate-900 cursor-pointer"
                        }`}
                      >
                        Signup
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Mobile tabs */}
              <div className="sm:hidden mb-6 bg-slate-100 p-1 rounded-full border border-slate-200">
                <div className="flex">
                  <button
                    type="button"
                    onClick={() => switchMode("login")}
                    className={`flex-1 px-5 py-2 rounded-full text-sm font-bold transition-all ${
                      mode === "login"
                        ? "bg-white border border-slate-200 text-slate-900 shadow-sm"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Login
                  </button>
                  <button
                    type="button"
                    onClick={() => switchMode("signup")}
                    className={`flex-1 px-5 py-2 rounded-full text-sm font-bold transition-all ${
                      mode === "signup"
                        ? "bg-white border border-slate-200 text-slate-900 shadow-sm"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Signup
                  </button>
                </div>
              </div>

              {mode === "login" ? (
                <form onSubmit={handleSubmit} className="space-y-5">
                  {loginErrorMessage && (
                    <ErrorDisplay
                      clearError={() => setLoginErrorMessage(null)}
                      errorMessage={loginErrorMessage}
                    />
                  )}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Email
                    </label>
                    <div className="relative">
                      <Mail
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                        size={18}
                      />
                      <input
                        name="email"
                        type="email"
                        value={formData.email}
                        required
                        autoComplete="email"
                        placeholder="you@example.com"
                        className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 bg-white outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 text-slate-900 placeholder:text-slate-400"
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <Lock
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                        size={18}
                      />
                      <input
                        name="password"
                        value={formData.password}
                        type={showPassword ? "text" : "password"}
                        required
                        autoComplete="current-password"
                        placeholder="••••••••"
                        className="w-full pl-11 pr-11 py-3 rounded-2xl border border-slate-200 bg-white outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 text-slate-900 placeholder:text-slate-400"
                        onChange={handleInputChange}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((s: boolean) => !s)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
                        aria-label={
                          showPassword ? "Hide password" : "Show password"
                        }
                      >
                        {showPassword ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-4 justify-end">
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
                      onClick={() => switchMode("signup")}
                      className="font-bold text-indigo-700 hover:text-indigo-800 cursor-pointer"
                    >
                      Sign up
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    {registrationErrorMessage && (
                      <ErrorDisplay
                        clearError={() => setRegistrationErrorMessage(null)}
                        errorMessage={registrationErrorMessage}
                      />
                    )}
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Full name
                    </label>
                    <div className="relative">
                      <User
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                        size={18}
                      />
                      <input
                        name="fullName"
                        type="text"
                        value={formData.fullName}
                        required
                        autoComplete="name"
                        placeholder="John Doe"
                        className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 bg-white outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 text-slate-900 placeholder:text-slate-400"
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Email
                    </label>
                    <div className="relative">
                      <Mail
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                        size={18}
                      />
                      <input
                        name="email"
                        type="email"
                        value={formData.email}
                        required
                        autoComplete="email"
                        placeholder="you@example.com"
                        className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 bg-white outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 text-slate-900 placeholder:text-slate-400"
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <Lock
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                        size={18}
                      />
                      <input
                        name="password"
                        value={formData.password}
                        type={showPassword ? "text" : "password"}
                        required
                        autoComplete="new-password"
                        placeholder="Create a password"
                        className="w-full pl-11 pr-11 py-3 rounded-2xl border border-slate-200 bg-white outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 text-slate-900 placeholder:text-slate-400"
                        onChange={handleInputChange}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((s: boolean) => !s)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
                        aria-label={
                          showPassword ? "Hide password" : "Show password"
                        }
                      >
                        {showPassword ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>
                    </div>
                    {/* --- password strength indicator --- */}
                    {mode === "signup" && formData.password.length > 0 && (
                      <div className="mt-3 p-4 bg-slate-50 border border-slate-200 rounded-2xl animate-in fade-in slide-in-from-top-1 duration-300">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                          Password Requirements
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {passwordCriteria.map((c, i) => (
                            <div key={i} className="flex items-center gap-2">
                              <div
                                className={`size-1.5 rounded-full transition-colors duration-300 ${c.met ? "bg-emerald-500" : "bg-slate-300"}`}
                              />
                              <span
                                className={`text-xs transition-colors duration-300 ${c.met ? "text-emerald-700 font-medium" : "text-slate-400"}`}
                              >
                                {c.label}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Confirm password
                    </label>
                    <div className="relative">
                      <Lock
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                        size={18}
                      />
                      <input
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        type={showConfirmPassword ? "text" : "password"}
                        required
                        autoComplete="new-password"
                        placeholder="Re-enter your password"
                        className="w-full pl-11 pr-11 py-3 rounded-2xl border border-slate-200 bg-white outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 text-slate-900 placeholder:text-slate-400"
                        onChange={handleInputChange}
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword((s: boolean) => !s)
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
                        aria-label={
                          showConfirmPassword
                            ? "Hide confirm password"
                            : "Show confirm password"
                        }
                      >
                        {showConfirmPassword ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-indigo-600 text-white px-8 py-3 rounded-full font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-500/20 transition-all cursor-pointer disabled:cursor-not-allowed disabled:hover:bg-none disabled:bg-gray-400"
                    disabled={isLoading || (mode === "signup" && !isPasswordStrong)}
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
                      onClick={() => switchMode("login")}
                      className="font-bold text-indigo-700 hover:text-indigo-800 cursor-pointer"
                    >
                      Log in
                    </button>
                  </div>

                  <p className="text-xs leading-relaxed text-slate-500">
                    By continuing, you agree to our Terms and acknowledge our
                    Privacy Policy.
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
