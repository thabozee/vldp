"use client";

/**
 * SPOC portal layout — sidebar + mobile hamburger navigation
 * Requirements: 2.1, 2.9
 */

import { useState, useEffect } from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useInstitution } from "@/hooks/use-institution";
import { Button } from "@/components/ui/button";
import type { AuthUser } from "@/lib/types";
import {
  LayoutDashboard,
  Upload,
  History,
  User,
  LogOut,
  Menu,
  X,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

export default function SpocLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams<{ institution: string }>();
  const institution_id = params.institution;
  const pathname = usePathname();
  const router = useRouter();
  const { institution } = useInstitution();

  const [user, setUser] = useState<AuthUser | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems: NavItem[] = [
    {
      label: "Overview",
      href: `/${institution_id}/spoc`,
      icon: LayoutDashboard,
    },
    { label: "Upload", href: `/${institution_id}/spoc/upload`, icon: Upload },
    {
      label: "History",
      href: `/${institution_id}/spoc/history`,
      icon: History,
    },
    { label: "Profile", href: `/${institution_id}/spoc/profile`, icon: User },
  ];

  useEffect(() => {
    try {
      const stored = localStorage.getItem("vldp_user");
      if (!stored) {
        router.replace(`/${institution_id}/login`);
        return;
      }
      const parsed = JSON.parse(stored) as AuthUser;
      if (parsed.role !== "spoc") {
        router.replace(`/${institution_id}/login`);
        return;
      }
      setUser(parsed);
    } catch {
      router.replace(`/${institution_id}/login`);
    }
  }, [institution_id, router]);

  function handleSignOut() {
    localStorage.removeItem("vldp_user");
    router.push(`/${institution_id}/login`);
  }

  if (!user) return null;

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div
        className="px-5 py-5 text-white"
        style={{ backgroundColor: institution.primaryColor }}
      >
        <p className="text-xs font-medium uppercase tracking-wider opacity-75 mb-1">
          SPOC Portal
        </p>
        <h2 className="text-sm font-semibold leading-tight">
          {institution.name}
        </h2>
        <p className="text-xs opacity-80 mt-2 truncate">{user.name}</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {navItems.map(({ label, href, icon: Icon }) => {
          const isActive =
            href === `/${institution_id}/spoc`
              ? pathname === href
              : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "text-white"
                  : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
              }`}
              style={
                isActive
                  ? { backgroundColor: institution.primaryColor }
                  : undefined
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Sign out */}
      <div className="p-3 border-t">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-sm text-zinc-600 hover:text-zinc-900"
          onClick={handleSignOut}
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-zinc-50">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:flex-col w-56 shrink-0 bg-white border-r border-zinc-200">
        <SidebarContent />
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-56 bg-white border-r border-zinc-200 flex flex-col transform transition-transform duration-200 md:hidden ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <button
          className="absolute top-3 right-3 p-1 rounded-md text-zinc-500 hover:bg-zinc-100"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close menu"
        >
          <X className="w-4 h-4" />
        </button>
        <SidebarContent />
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile top bar */}
        <header className="md:hidden flex items-center gap-3 px-4 py-3 bg-white border-b border-zinc-200">
          <button
            className="p-1.5 rounded-md text-zinc-600 hover:bg-zinc-100"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <span
            className="text-sm font-semibold truncate"
            style={{ color: institution.primaryColor }}
          >
            {institution.shortName} — SPOC
          </span>
        </header>

        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
