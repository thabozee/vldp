"use client";

/**
 * Student portal layout — bottom nav (mobile) + left sidebar (desktop)
 * Requirements: 2.1, 2.9
 */

import { useState, useEffect } from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useInstitution } from "@/hooks/use-institution";
import { Button } from "@/components/ui/button";
import type { AuthUser } from "@/lib/types";
import { NOTIFICATIONS_STORE } from "@/lib/mock-data/notifications";
import {
  Home,
  PackageOpen,
  ShoppingCart,
  Receipt,
  User,
  Bell,
  LogOut,
  Menu,
  X,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

export default function StudentLayout({
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
  const [unreadCount, setUnreadCount] = useState(0);

  const navItems: NavItem[] = [
    { label: "Home", href: `/${institution_id}/student`, icon: Home },
    {
      label: "Allocations",
      href: `/${institution_id}/student/allocations`,
      icon: PackageOpen,
    },
    {
      label: "Buy Data",
      href: `/${institution_id}/student/buy-data`,
      icon: ShoppingCart,
    },
    {
      label: "Transactions",
      href: `/${institution_id}/student/transactions`,
      icon: Receipt,
    },
    {
      label: "Profile",
      href: `/${institution_id}/student/profile`,
      icon: User,
    },
  ];

  useEffect(() => {
    try {
      const stored = localStorage.getItem("vldp_user");
      if (!stored) {
        router.replace(`/${institution_id}/login`);
        return;
      }
      const parsed = JSON.parse(stored) as AuthUser;
      if (parsed.role !== "student") {
        router.replace(`/${institution_id}/login`);
        return;
      }
      setUser(parsed);
      const count = NOTIFICATIONS_STORE.filter(
        (n) => n.recipientId === parsed.id && !n.read,
      ).length;
      setUnreadCount(count);
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
      <div
        className="px-5 py-5 text-white"
        style={{ backgroundColor: institution.primaryColor }}
      >
        <p className="text-xs font-medium uppercase tracking-wider opacity-75 mb-1">
          Student Portal
        </p>
        <h2 className="text-sm font-semibold leading-tight">
          {institution.name}
        </h2>
        <p className="text-xs opacity-80 mt-2 truncate">{user.name}</p>
      </div>

      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {navItems.map(({ label, href, icon: Icon }) => {
          const isActive =
            href === `/${institution_id}/student`
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
    <div className="min-h-screen flex flex-col md:flex-row bg-zinc-50">
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

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 pb-16 md:pb-0">
        {/* Top bar */}
        <header className="flex items-center justify-between px-4 py-3 bg-white border-b border-zinc-200">
          <button
            className="md:hidden p-1.5 rounded-md text-zinc-600 hover:bg-zinc-100"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <span
            className="text-sm font-semibold truncate md:ml-0 ml-2"
            style={{ color: institution.primaryColor }}
          >
            {institution.shortName}
          </span>
          <div className="relative">
            <Bell className="w-5 h-5 text-zinc-500" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center px-0.5">
                {unreadCount}
              </span>
            )}
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 bg-white border-t border-zinc-200 z-20 flex">
        {navItems.map(({ label, href, icon: Icon }) => {
          const isActive =
            href === `/${institution_id}/student`
              ? pathname === href
              : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex-1 flex flex-col items-center justify-center py-2 gap-0.5 text-[10px] font-medium transition-colors ${
                isActive ? "text-zinc-900" : "text-zinc-400"
              }`}
              style={isActive ? { color: institution.primaryColor } : undefined}
            >
              <Icon className="w-5 h-5" />
              {label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
