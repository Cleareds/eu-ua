"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAdminAuth } from "./useAdminAuth";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/admin/dashboard", label: "Dashboard", icon: "⊞" },
  { href: "/admin/art", label: "Art Objects", icon: "🖼" },
  { href: "/admin/artists", label: "Artists", icon: "👤" },
  { href: "/admin/waves", label: "Art Waves", icon: "🌊" },
];

export default function AdminShell({ children, title }: { children: React.ReactNode; title: string }) {
  const { state, email, signOut } = useAdminAuth();
  const router = useRouter();

  useEffect(() => {
    if (state === "unauthenticated") router.replace("/admin");
  }, [state, router]);

  if (state === "loading") {
    return (
      <div className="fixed inset-0 z-[200] bg-gray-50 flex items-center justify-center">
        <div className="text-gray-400 text-sm">Loading…</div>
      </div>
    );
  }

  if (state === "unauthenticated") return null;

  return (
    <div className="fixed inset-0 z-[200] bg-gray-50 flex overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-56 shrink-0 flex flex-col border-r border-gray-200 bg-white">
        <div className="h-14 flex items-center px-4 border-b border-gray-200">
          <Link href="/admin/dashboard" className="font-bold text-sm" style={{ color: "#003399" }}>
            EU-UA Admin
          </Link>
          <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded" style={{ backgroundColor: "#FFD700", color: "#003399" }}>
            Art CMS
          </span>
        </div>
        <nav className="flex-1 py-3 px-2 space-y-0.5">
          {navItems.map(item => (
            <AdminNavLink key={item.href} href={item.href} icon={item.icon} label={item.label} />
          ))}
        </nav>
        <div className="p-3 border-t border-gray-100 space-y-1">
          <div className="text-xs text-gray-400 truncate px-2">{email}</div>
          <button
            onClick={signOut}
            className="w-full text-left text-xs px-2 py-1.5 rounded text-red-600 hover:bg-red-50 transition-colors"
          >
            Sign out
          </button>
          <Link
            href="/"
            target="_blank"
            className="block text-xs px-2 py-1.5 rounded text-gray-500 hover:bg-gray-100 transition-colors"
          >
            View site ↗
          </Link>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 border-b border-gray-200 bg-white flex items-center px-6">
          <h1 className="text-sm font-semibold text-gray-900">{title}</h1>
        </header>
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

function AdminNavLink({ href, icon, label }: { href: string; icon: string; label: string }) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-2.5 px-2 py-1.5 rounded text-sm text-gray-700 hover:bg-gray-50 transition-colors"
      )}
    >
      <span className="text-base leading-none">{icon}</span>
      {label}
    </Link>
  );
}
