"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/eu-accession", label: "EU Accession" },
  { href: "/cultural-map", label: "Map" },
  { href: "/timeline", label: "Timeline" },
  { href: "/people", label: "People" },
  { href: "/heritage", label: "Heritage" },
  { href: "/data-dashboard", label: "Data" },
  { href: "/news", label: "News" },
  { href: "/myths", label: "Myths" },
  { href: "/quiz", label: "Quiz" },
  { href: "/contact", label: "Contact" },
];

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10" style={{ backgroundColor: "#003399" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="flex items-center gap-1.5">
              <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: "#FFD700" }}>
                <span className="text-sm font-bold" style={{ color: "#003399" }}>EU</span>
              </div>
              <span className="text-white font-bold text-lg tracking-tight">
                UA.com
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  pathname === link.href
                    ? "text-[#FFD700] bg-white/10"
                    : "text-white/80 hover:text-white hover:bg-white/10"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Mobile menu placeholder */}
          <div className="md:hidden">
            <MobileMenu pathname={pathname} />
          </div>
        </div>
      </div>
    </header>
  );
}

function MobileMenu({ pathname }: { pathname: string }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  // Close on route change
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="text-white p-2 rounded-md hover:bg-white/10"
        aria-label={open ? "Close menu" : "Open menu"}
      >
        {open ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        )}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 z-[9999]" style={{ backgroundColor: "#003399" }}>
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className={cn(
                "block px-4 py-2 text-sm",
                pathname === link.href
                  ? "text-[#FFD700]"
                  : "text-white/80 hover:text-white"
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
