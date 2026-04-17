"use client";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, LogOut, Settings, User } from "lucide-react";
import Link from "next/link";

import { NavbarLink, NavbarUserProfile } from "./navbar.types";
import { use } from "react";

type Props = {
  isOpen: boolean;
  isLoggedIn: boolean;
  links: NavbarLink[];
  userProfilePromise: Promise<any>;
  onClose: () => void;
  onOpenProfile: () => void;
  onLogout: () => void;
};

export default function NavbarMobileDrawer({
  isOpen,
  isLoggedIn,
  links,
  userProfilePromise,
  onClose,
  onOpenProfile,
  onLogout,
}: Props) {
  const [userProfileRes] = use(userProfilePromise);
  console.log("userpromise", userProfileRes);
  const currentUserProfile = userProfileRes.data;
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="absolute top-20 left-0 w-full bg-white border-b border-slate-200 shadow-2xl md:hidden z-99 overflow-y-auto max-h-[calc(100vh-80px)]"
        >
          {isLoggedIn && (
            <div className="px-6 py-6 bg-slate-50/80 border-b border-slate-100">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div
                    className="size-14 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xl font-black shadow-lg bg-cover bg-center shadow-indigo-200"
                    style={{
                      backgroundImage: `url(${currentUserProfile?.profileImage})`,
                    }}
                  >
                    {!currentUserProfile?.profileImage &&
                      currentUserProfile?.user?.name
                        .split(" ")[0][0]
                        .toUpperCase() +
                        currentUserProfile?.user?.name
                          .split(" ")[1][0]
                          .toUpperCase()}
                  </div>
                  <div className="absolute -bottom-1 -right-1 size-4 bg-emerald-500 border-2 border-white rounded-full" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-extrabold text-slate-900 truncate">
                    {currentUserProfile?.user?.name}
                  </h3>
                  <p className="text-xs font-semibold text-slate-500 truncate mb-2">
                    {currentUserProfile?.user?.email}
                  </p>
                  <div className="flex gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-indigo-100 text-[10px] font-bold text-indigo-700 uppercase tracking-wider">
                      {/* {userProfile.badge} */}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="p-6 flex flex-col gap-2">
            {links.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="flex items-center justify-between py-4 px-2 text-lg font-bold text-slate-700 border-b border-slate-50 active:bg-slate-50 rounded-xl transition-colors"
                onClick={onClose}
              >
                {link.name}
                <ChevronDown size={18} className="-rotate-90 text-slate-300" />
              </a>
            ))}

            {!isLoggedIn ? (
              <div className="flex flex-col gap-4 pt-4">
                <Link
                  href="/auth?mode=login"
                  onClick={onClose}
                  className="w-full py-4 text-slate-700 font-bold border border-slate-200 rounded-2xl text-center active:bg-slate-50"
                >
                  Log In
                </Link>
                <Link
                  href="/auth?mode=signup"
                  onClick={onClose}
                  className="w-full py-4 bg-indigo-600 text-white font-bold rounded-2xl shadow-lg shadow-indigo-500/20 text-center active:bg-indigo-700"
                >
                  Get Started
                </Link>
              </div>
            ) : (
              <Link
                className="flex flex-col gap-2 pt-4 *:cursor-pointer"
                href={`/profile/${currentUserProfile?.profileId}`}
              >
                <button
                  // onClick={onOpenProfile}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl text-slate-700 font-bold active:bg-slate-50"
                >
                  <User size={20} className="text-slate-400" /> My Profile
                </button>
                <button
                  onClick={onClose}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl text-slate-700 font-bold active:bg-slate-50"
                >
                  <Settings size={20} className="text-slate-400" /> Settings
                </button>

                <div className="h-px bg-slate-100 my-2 mx-4" />

                <button
                  onClick={onLogout}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl text-red-500 font-bold active:bg-red-50 transition-colors cursor-pointer"
                >
                  <LogOut size={20} /> Sign Out
                </button>
              </Link>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
