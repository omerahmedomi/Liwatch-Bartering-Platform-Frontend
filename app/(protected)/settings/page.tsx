"use client";

import { useTheme } from "next-themes";
import { useEffect, useState, useMemo } from "react";
import { Moon, Sun, Monitor, ArrowLeft, Lock } from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import api from "@/lib/axios";
import { getErrorMessage } from "@/lib/error";
import PasswordStrengthChecklist from "@/components/auth/PasswordStrengthChecklist";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Password fields
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Avoid hydration mismatch by waiting for mount
  useEffect(() => {
    setMounted(true);
  }, []);

  const passwordCriteria = useMemo(() => {
    return [
      { label: "At least 8 characters", met: newPassword.length >= 8 },
      { label: "At least one number", met: /\d/.test(newPassword) },
      {
        label: "At least one special character (@$!%*?)",
        met: /[@$!%*?&]/.test(newPassword),
      },
      { label: "At least one uppercase letter", met: /[A-Z]/.test(newPassword) },
    ];
  }, [newPassword]);

  const isPasswordStrong = passwordCriteria.every((criterion) => criterion.met);

  const handlePasswordChangeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!isPasswordStrong) {
      setErrorMsg("New password does not meet complexity requirements.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg("New passwords do not match.");
      return;
    }

    setIsUpdating(true);

    try {
      await api.post("/api/auth/change-password", {
        currentPassword,
        newPassword,
      });
      setSuccessMsg("Password updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: unknown) {
      console.error(err);
      const msg = getErrorMessage(err);
      setErrorMsg(typeof msg === "string" ? msg : "Failed to update password.");
    } finally {
      setIsUpdating(false);
    }
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300 pt-15">
      <Navbar isLoggedIn={true} />
      
      <main className="max-w-4xl mx-auto px-4 py-12 space-y-8">
        <div className="flex items-center gap-4">
          <Link 
            href="/" 
            className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="text-slate-700 dark:text-slate-300" size={24} />
          </Link>
          <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Settings
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              Manage your preferences and platform configuration.
            </p>
          </div>
        </div>

        {/* Appearance Container */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 md:p-8 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Appearance</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Light Theme Option */}
            <button
              onClick={() => setTheme("light")}
              className={`flex flex-col items-center justify-center p-6 rounded-xl border-2 transition-all duration-200 cursor-pointer ${
                theme === "light" 
                  ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-950/20" 
                  : "border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700"
              }`}
            >
              <div className={`p-3 rounded-full mb-3 ${theme === "light" ? "bg-indigo-100 text-indigo-600" : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"}`}>
                <Sun size={24} />
              </div>
              <span className={`font-bold ${theme === "light" ? "text-indigo-700 dark:text-indigo-400" : "text-slate-700 dark:text-slate-300"}`}>
                Light Mode
              </span>
            </button>

            {/* Dark Theme Option */}
            <button
              onClick={() => setTheme("dark")}
              className={`flex flex-col items-center justify-center p-6 rounded-xl border-2 transition-all duration-200 cursor-pointer ${
                theme === "dark" 
                  ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-950/20" 
                  : "border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700"
              }`}
            >
              <div className={`p-3 rounded-full mb-3 ${theme === "dark" ? "bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400" : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"}`}>
                <Moon size={24} />
              </div>
              <span className={`font-bold ${theme === "dark" ? "text-indigo-700 dark:text-indigo-400" : "text-slate-700 dark:text-slate-300"}`}>
                Dark Mode
              </span>
            </button>

            {/* System Theme Option */}
            <button
              onClick={() => setTheme("system")}
              className={`flex flex-col items-center justify-center p-6 rounded-xl border-2 transition-all duration-200 cursor-pointer ${
                theme === "system" 
                  ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-950/20" 
                  : "border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700"
              }`}
            >
              <div className={`p-3 rounded-full mb-3 ${theme === "system" ? "bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400" : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"}`}>
                <Monitor size={24} />
              </div>
              <span className={`font-bold ${theme === "system" ? "text-indigo-700 dark:text-indigo-400" : "text-slate-700 dark:text-slate-300"}`}>
                System Preference
              </span>
            </button>
          </div>
          
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-6 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl">
            Choose how Liwatch looks to you. Select a single theme, or sync with your system and automatically switch between light and dark themes.
          </p>
        </div>

        {/* Security / Password Container */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 md:p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <Lock className="text-indigo-600 dark:text-indigo-400" size={24} />
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Security & Password</h2>
          </div>

          {errorMsg && (
            <div className="mb-6 p-4 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800 rounded-2xl text-sm font-semibold text-rose-700 dark:text-rose-400">
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="mb-6 p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 rounded-2xl text-sm font-semibold text-emerald-700 dark:text-emerald-450">
              {successMsg}
            </div>
          )}

          <form onSubmit={handlePasswordChangeSubmit} className="space-y-5 max-w-xl">
            <div className="space-y-2">
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">
                Current Password
              </label>
              <input
                type="password"
                placeholder="Enter current password"
                value={currentPassword}
                onChange={(e) => {
                  setErrorMsg(null);
                  setCurrentPassword(e.target.value);
                }}
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all placeholder:text-slate-400"
              />
              <p className="text-xs text-slate-400">
                * If you registered via Google OAuth, you can leave current password blank.
              </p>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">
                New Password
              </label>
              <input
                type="password"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => {
                  setErrorMsg(null);
                  setNewPassword(e.target.value);
                }}
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all placeholder:text-slate-400"
              />
              {newPassword.length > 0 && (
                <PasswordStrengthChecklist criteria={passwordCriteria} />
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">
                Confirm New Password
              </label>
              <input
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => {
                  setErrorMsg(null);
                  setConfirmPassword(e.target.value);
                }}
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all placeholder:text-slate-400"
              />
            </div>

            <button
              type="submit"
              disabled={isUpdating || !isPasswordStrong}
              className="bg-indigo-600 text-white px-8 py-3 rounded-full font-bold hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-500/20 transition-all cursor-pointer disabled:cursor-not-allowed disabled:bg-slate-300 dark:disabled:bg-slate-800 disabled:shadow-none"
            >
              {isUpdating ? "Updating..." : "Update Password"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}

