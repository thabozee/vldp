"use client";

/**
 * Global Vodacom Admin layout — /admin/*
 * Not institution-scoped. One sidebar, all institutions visible.
 */

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Users,
  Wifi,
  UserCog,
  PieChart,
  ScrollText,
  BarChart2,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import type { AuthUser } from "@/lib/types";

const V = { red: "#E60000", dark: "#1A1A1A", sidebar: "#111111" };

const NAV = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/institutions", label: "Institutions", icon: Users },
  { href: "/admin/provisioning", label: "Provisioning", icon: Wifi },
  { href: "/admin/spocs", label: "SPOCs", icon: UserCog },
  { href: "/admin/segmentation", label: "Segmentation", icon: PieChart },
  { href: "/admin/audit-log", label: "Audit Log", icon: ScrollText },
  { href: "/admin/reports", label: "Reports", icon: BarChart2 },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [open, setOpen] = useState(false);
  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    if (isLoginPage) return; // don't run auth check on login page
    const raw = localStorage.getItem("vldp_user");
    if (!raw) {
      router.replace("/admin/login");
      return;
    }
    try {
      const u = JSON.parse(raw) as AuthUser;
      if (u.role !== "admin") {
        router.replace("/admin/login");
        return;
      }
      setUser(u);
    } catch {
      router.replace("/admin/login");
    }
  }, [router, isLoginPage]);

  // Login page — render without any shell
  if (isLoginPage) return <>{children}</>;

  if (!user)
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: "#F5F5F5" }}
      >
        <p className="text-sm animate-pulse" style={{ color: "#888" }}>
          Checking authentication…
        </p>
      </div>
    );

  return (
    <div className="min-h-screen flex">
      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 w-60 flex flex-col transform transition-transform duration-200 ${open ? "translate-x-0" : "-translate-x-full"} lg:static lg:translate-x-0`}
        style={{ backgroundColor: V.sidebar }}
      >
        {/* Logo */}
        <div className="px-5 py-5 flex items-center gap-3 border-b border-white/10">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center font-black text-sm"
            style={{ backgroundColor: V.red, color: "#fff" }}
          >
            V
          </div>
          <div>
            <p className="text-[10px] text-white/50 leading-none">
              Vodacom Admin
            </p>
            <p className="text-xs font-bold text-white leading-none mt-0.5">
              VLAP Portal
            </p>
          </div>
          <button
            className="ml-auto lg:hidden text-white/40"
            onClick={() => setOpen(false)}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 overflow-y-auto">
          <ul className="space-y-0.5 px-2">
            {NAV.map(({ href, label, icon: Icon }) => {
              const active =
                pathname === href || pathname.startsWith(href + "/");
              return (
                <li key={href}>
                  <Link
                    href={href}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors"
                    style={{
                      backgroundColor: active ? V.red : "transparent",
                      color: active ? "#fff" : "rgba(255,255,255,0.55)",
                    }}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-white/10">
          <p className="text-xs text-white/60 truncate">{user.name}</p>
          <p className="text-[10px] text-white/30 truncate mb-2">
            {user.email}
          </p>
          <button
            onClick={() => {
              localStorage.removeItem("vldp_user");
              router.push("/admin/login");
            }}
            className="flex items-center gap-2 text-xs text-white/40 hover:text-white/70 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" /> Sign out
          </button>
        </div>
      </aside>

      {/* Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="lg:hidden flex items-center gap-3 px-4 py-3 bg-white border-b sticky top-0 z-10">
          <button onClick={() => setOpen(true)} style={{ color: V.red }}>
            <Menu className="w-5 h-5" />
          </button>
          <span className="text-sm font-semibold" style={{ color: V.dark }}>
            Vodacom Admin — VLAP
          </span>
        </header>
        <main
          className="flex-1 p-4 md:p-6 overflow-auto"
          style={{ backgroundColor: "#F5F5F5" }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
