"use client";

import { Suspense, useEffect, useRef, useState } from "react";

import { LoaderCircle, LoaderPinwheelIcon, Menu, X, PlusCircle, RefreshCw } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";

import NavbarBrand from "./navbar/NavbarBrand";
import NavbarDesktopNavigation from "./navbar/NavbarDesktopNavigation";
import NavbarGuestDesktopActions from "./navbar/NavbarGuestDesktopActions";
import NavbarMobileDrawer from "./navbar/NavbarMobileDrawer";
import NavbarProfileMenu from "./navbar/NavbarProfileMenu";
import { NavbarLink, NavbarUserProfile } from "./navbar/navbar.types";
import api from "@/lib/axios";
import { ErrorBoundary } from "react-error-boundary";

type Props = {
  isLoggedIn: boolean;
};

const guestLinks: NavbarLink[] = [
  { name: "How it works", href: "/#howitworks" },
  { name: "Explore", href: "#" },
  { name: "Community", href: "#" },
];

const authenticatedLinks: NavbarLink[] = [
  { name: "Listings", href: "/listings" },
  { name: "Messages", href: "/messages" },
  { name: "Completed", href: "/completed-negotiations" },
  { name: "Community", href: "/community" },
  { name: "Requests", href: "/requests" },
  { name: "Notifications", href: "/notifications" },
];

const demoUserProfile: NavbarUserProfile = {
  initials: "JD",
  fullName: "John Doe",
  email: "johndoe@example.com",
  badge: "Pro Trader",
};

export default function Navbar({ isLoggedIn }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();

  const navLinks = isLoggedIn ? authenticatedLinks : guestLinks;

  const [contextPromise] = useState(() => {
    // 1. If they are a guest, don't even make the network request. Just resolve empty.
    if (!isLoggedIn) return Promise.resolve([{ data: null }]);

    // 2. If logged in, make the request, but use .catch() to silently handle expired tokens
    return Promise.all([
      api.get("/api/profile/me").catch(() => ({ data: null })),
    ]);
  });

  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (isLoggedIn) {
      api
        .get("/api/notifications/unread-count")
        .then((res) => setUnreadCount(res.data))
        .catch((err) => console.error("Failed to fetch unread notifications", err));
    }
  }, [isLoggedIn]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("liwatch_token");
    window.location.href = "/";
  };

  const handleMobileMenuToggle = () => {
    setIsProfileOpen(false);
    setIsOpen((current) => !current);
  };

  const handleOpenProfile = () => {
    router.push("/profile");
    setIsOpen(false);
    setIsProfileOpen(false);
  };

  return (
    <nav className="fixed top-0 w-full z-100 border-b border-slate-300 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <NavbarBrand />
        <NavbarDesktopNavigation links={navLinks} unreadCount={unreadCount} />

        <div className="flex items-center gap-3 md:gap-4">
          {pathname !== "/" && (
            <div className="flex items-center gap-2 mr-1">
              <Link 
                href="/cycle-swap/builder" 
                className="flex items-center justify-center bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white w-9 h-9 md:w-10 md:h-10 rounded-full transition-all shadow-md shadow-emerald-500/20"
                title="Cycle Swap"
              >
                <RefreshCw size={18} />
              </Link>
              <Link 
                href="/create-post" 
                className="flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white w-9 h-9 md:w-10 md:h-10 rounded-full transition-all shadow-md shadow-indigo-500/20"
                title="Post Item"
              >
                <PlusCircle size={18} />
              </Link>
            </div>
          )}

          {!isLoggedIn ? (
            <NavbarGuestDesktopActions />
          ) : (
            <Suspense
              fallback={<LoaderCircle className="max-md:hidden animate-spin" />}
            >
              {" "}
              <NavbarProfileMenu
                dropdownRef={dropdownRef}
                isOpen={isProfileOpen}
                userProfilePromise={contextPromise}
                onToggle={() => setIsProfileOpen((current) => !current)}
                onOpenProfile={handleOpenProfile}
                onLogout={handleLogout}
              />
            </Suspense>
          )}

          <button
            className="md:hidden text-slate-900 dark:text-slate-100 p-2 cursor-pointer -mr-2"
            onClick={handleMobileMenuToggle}
          >
            {isOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>
      {/* <ErrorBoundary fallback={'Something went wrong'}> */}
      <Suspense fallback={<LoaderCircle className="hidden animate-spin" />}>
        <NavbarMobileDrawer
          isOpen={isOpen}
          isLoggedIn={isLoggedIn}
          links={navLinks}
          userProfilePromise={contextPromise}
          unreadCount={unreadCount}
          onClose={() => setIsOpen(false)}
          onOpenProfile={handleOpenProfile}
          onLogout={handleLogout}
        />
      </Suspense>
      {/* </ErrorBoundary> */}
    </nav>
  );
}
