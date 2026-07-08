"use client";

import { usePathname } from "next/navigation";
import TransitionLink from "./TransitionLink";

const LINKS = [
  { href: "/", label: "HOME" },
  { href: "/about", label: "ABOUT" },
  { href: "/works", label: "WORKS" },
  { href: "/contact", label: "CONTACT" },
];

// Persistent navigation. The old rotated "MENU" only linked home and was
// hidden below lg, leaving every subpage a dead end (and mobile with no
// navigation at all).
export default function Nav() {
  const pathname = usePathname();

  return (
    <nav className="nav-menu z-[60] fixed top-6 lg:right-12 md:right-10 right-5 font-sans lg:tracking-[.3em] tracking-[.2em] text-[10px] lg:text-xs flex lg:gap-6 md:gap-5 gap-3 pointer-events-auto">
      {LINKS.map(({ href, label }) => {
        const active =
          href === "/" ? pathname === "/" : pathname.startsWith(href);
        return (
          <TransitionLink
            key={href}
            href={href}
            className={
              active
                ? "text-white border-b border-white/70 pb-0.5"
                : "text-white/60 hover:text-white transition-colors duration-200 pb-0.5"
            }
          >
            {label}
          </TransitionLink>
        );
      })}
    </nav>
  );
}
