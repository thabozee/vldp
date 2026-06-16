"use client";

/**
 * Admin shell layout with sidebar navigation.
 * Requires admin role — redirects to login if no valid token.
 *
 * Requirements: 13.1, 2.9
 */

import { useEffect, useState } from "react";
import { useParams, useRouter, usePathname } from "next/navigation";
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

const NAV_ITEMS = [
  { href: "admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "admin/students", label: "Students", icon: Users },
  { href: "admin/provisioning", label: "Provisioning", icon: Wifi },
  { href: "admin/spocs", label: "SPOCs", icon: UserCog },
  { href: "admin/segmentation", label: "Segmentation", icon: PieChart },
  { href: "admin/audit-log", label: "Audit Log", icon: ScrollText },
  { href: "admin/reports", label: "Reports", icon: BarChart2 },
  { href: "admin/settings", label: "Settings", icon: Settings },
];

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const params = useParams<{ institution: string }>();
  const router = useRouter();
  const pathname = usePathname();
  const institution = params?.institution ?? "";

  const [user, setUser] = useState<AuthUser | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [institutionName, setInstitutionName] = useState("");

  useEffect(() => {
    // Read token from localStorage (set at login)
    const raw = localStorage.getItem("vldp_user");
    if (!raw) {
      router.replace(`/${institution}/login`);
      return;
    }
    try {
      const parsed = JSON.parse(raw) as AuthUser;
      if (parsed.role !== "admin") {
        router.replace(`/${institution}/login`);
        return;
      }
      setUser(parsed);
    } catch {
      router.replace(`/${institution}/login`);
    }
  }, [institution, router]);

  // Load institution name from mock data (client-side)
  useEffect(() => {
    if (!institution) return;
    import("@/lib/mock-data/institutions").then(({ getInstitutionById }) => {
      const inst = getInstitutionById(institution);
      if (inst) setInstitutionName(inst.name);
    });
  }, [institution]);

  const handleSignOut = () => {
    localStorage.removeItem("vldp_user");
    router.push(`/${institution}/login`);
  };

  if (!user) {
    // Render nothing while auth check is in progress
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <div className="text-zinc-500 text-sm animate-pulse">
          Checking authentication…
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-zinc-50">
      {/* ── Mobile sidebar overlay ────────────────────────────────────── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar ───────────────────────────────────────────────────── */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-30 w-64 bg-zinc-900 text-zinc-100 flex flex-col
          transform transition-transform duration-200
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          lg:static lg:translate-x-0 lg:flex
        `}
      >
        {/* Header */}
        <div className="px-4 py-5 border-b border-zinc-800 flex items-center justify-between">
          <div>
            <p className="text-xs text-zinc-400 uppercase tracking-wider mb-0.5">
              Admin Portal
            </p>
            <p className="text-sm font-semibold leading-tight truncate max-w-[180px]">
              {institutionName || institution}
            </p>
          </div>
          <button
            className="lg:hidden text-zinc-400 hover:text-white"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 overflow-y-auto">
          <ul className="space-y-0.5 px-2">
            {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
              const fullPath = `/${institution}/${href}`;
              // Match exact for dashboard, prefix for others
              const isActive =
                href === "admin"
                  ? pathname === `/${institution}/admin`
                  : pathname.startsWith(fullPath);

              return (
                <li key={href}>
                  <Link
                    href={fullPath}
                    onClick={() => setSidebarOpen(false)}
                    className={`
                      flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                      transition-colors
                      ${
                        isActive
                          ? "bg-zinc-700 text-white"
                          : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
                      }
                    `}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer — user info + sign out */}
        <div className="px-4 py-4 border-t border-zinc-800 space-y-2">
          <p className="text-xs text-zinc-400 truncate">{user.name}</p>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 text-xs text-zinc-400 hover:text-white transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign out
          </button>
        </div>
      </aside>

      {/* ── Main content ──────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile top bar */}
        <header className="lg:hidden flex items-center gap-3 px-4 py-3 bg-white border-b sticky top-0 z-10">
          <button
            onClick={() => setSidebarOpen(true)}
            aria-label="Open sidebar"
            className="text-zinc-500 hover:text-zinc-900"
          >
            <Menu className="w-5 h-5" />
          </button>
          <span className="text-sm font-medium truncate">
            {institutionName || institution} — Admin
          </span>
        </header>

        <main className="flex-1 p-4 md:p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
