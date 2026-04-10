import { NavbarLink } from "./navbar.types";

type Props = {
  links: NavbarLink[];
};

export default function NavbarDesktopNavigation({ links }: Props) {
  return (
    <div className="hidden md:flex items-center gap-10 text-slate-600 font-medium text-sm tracking-wide">
      {links.map((link) => (
        <a
          key={link.name}
          href={link.href}
          className="hover:text-indigo-600 transition-colors uppercase"
        >
          {link.name}
        </a>
      ))}
    </div>
  );
}
