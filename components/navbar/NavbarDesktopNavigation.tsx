import { NavbarLink } from "./navbar.types";

type Props = {
  links: NavbarLink[];
  unreadCount?: number;
};

export default function NavbarDesktopNavigation({ links, unreadCount = 0 }: Props) {
  return (
    <div className="hidden md:flex items-center gap-10 text-slate-600 dark:text-slate-300 font-medium text-sm tracking-wide">
      {links.map((link) => {
        const isNotification = link.name.toLowerCase() === "notifications";
        const hasUnread = isNotification && unreadCount > 0;

        return (
          <a
            key={link.name}
            href={link.href}
            className={`hover:text-indigo-600 transition-colors uppercase relative flex items-center ${
              hasUnread ? "font-black text-indigo-600 dark:text-indigo-400" : ""
            }`}
          >
            {link.name}
            {hasUnread && (
              <span className="ml-2 flex items-center justify-center min-w-5 h-5 px-1.5 text-[10px] font-bold leading-none text-white bg-red-500 rounded-full animate-pulse shrink-0">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </a>
        );
      })}
    </div>
  );
}
