"use client";

import { Suspense, useEffect, useRef, useState } from "react";

import { LoaderCircle, LoaderPinwheelIcon, Menu, X } from "lucide-react";
import { useRouter } from "next/navigation";

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
  { name: "Messages", href: "#" },
  { name: "Community", href: "#" },
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

  const navLinks = isLoggedIn ? authenticatedLinks : guestLinks;

 const [contextPromise] = useState(() => {
    // 1. If they are a guest, don't even make the network request. Just resolve empty.
    if (!isLoggedIn) return Promise.resolve([{ data: null }]);
    
    // 2. If logged in, make the request, but use .catch() to silently handle expired tokens
    return Promise.all([
      api.get("/api/profile/me").catch(() => ({ data: null })),
    ]);
  });
 
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
    <nav className="fixed top-0 w-full z-100 border-b border-slate-300 bg-white/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <NavbarBrand />
        <NavbarDesktopNavigation links={navLinks} />

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
          className="md:hidden text-slate-900 p-2 cursor-pointer"
          onClick={handleMobileMenuToggle}
        >
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>
      {/* <ErrorBoundary fallback={'Something went wrong'}> */}
      <Suspense
        fallback={<LoaderCircle className="hidden animate-spin" />}
      >
        <NavbarMobileDrawer
          isOpen={isOpen}
          isLoggedIn={isLoggedIn}
          links={navLinks}
          userProfilePromise={contextPromise}
          onClose={() => setIsOpen(false)}
          onOpenProfile={handleOpenProfile}
          onLogout={handleLogout}
        />
      </Suspense>
      {/* </ErrorBoundary> */}
    </nav>
  );
}
