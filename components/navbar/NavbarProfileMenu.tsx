import type { RefObject } from "react";

import { ChevronDown, LogOut, Settings, User } from "lucide-react";

import { NavbarUserProfile } from "./navbar.types";

type Props = {
  dropdownRef: RefObject<HTMLDivElement | null>;
  isOpen: boolean;
  userProfile: NavbarUserProfile;
  onToggle: () => void;
  onOpenProfile: () => void;
  onLogout: () => void;
};

export default function NavbarProfileMenu({
  dropdownRef,
  isOpen,
  userProfile,
  onToggle,
  onOpenProfile,
  onLogout,
}: Props) {
  return (
    <div className="relative hidden md:block rounded-sm!" ref={dropdownRef}>
      <button
        onClick={onToggle}
        className="flex items-center gap-2 p-1.5 rounded-full bg-slate-100/50 hover:bg-slate-100 transition-all duration-200 cursor-pointer border border-transparent hover:border-slate-200"
      >
        <div className="size-8 rounded-full bg-indigo-600 ring-2 ring-white flex items-center justify-center text-white text-xs font-black shadow-sm">
          {userProfile.initials}
        </div>
        <ChevronDown
          size={14}
          className={`text-slate-500 mr-1 transition-transform duration-300 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 top-full w-64 rounded-sm bg-white/95 backdrop-blur-xl border border-slate-200/60 shadow-[0_20px_50px_rgba(79,70,229,0.1)] overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="px-5 py-4 bg-slate-50/50 border-b border-slate-100 mt-3">
            <p className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.15em] mb-1">
              Signed in as
            </p>
            <p className="text-sm font-bold text-slate-900 truncate">
              {userProfile.email}
            </p>
          </div>

          <div className="p-2">
            <div className="space-y-1 *:cursor-pointer">
              <button
                onClick={onOpenProfile}
                className="w-full flex items-center justify-between px-4 py-2.5 rounded-2xl text-slate-600 hover:bg-white hover:shadow-sm hover:text-indigo-600 transition-all group"
              >
                <div className="flex items-center gap-3 font-semibold text-sm">
                  <User
                    size={18}
                    className="text-slate-400 group-hover:text-indigo-500"
                  />
                  My Profile
                </div>
                <div className="size-1.5 rounded-full bg-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>

              <button className="w-full flex items-center gap-3 px-4 py-2.5 rounded-2xl text-slate-600 hover:bg-white hover:shadow-sm hover:text-indigo-600 transition-all font-semibold text-sm group">
                <Settings
                  size={18}
                  className="text-slate-400 group-hover:text-indigo-500"
                />
                Settings
              </button>
            </div>

            <div className="h-px bg-slate-100 my-2 mx-3" />

            <button
              onClick={onLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-slate-500 hover:text-red-600 hover:bg-red-50/50 transition-all font-bold text-sm cursor-pointer"
            >
              <LogOut size={18} className="opacity-70" />
              Log out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
