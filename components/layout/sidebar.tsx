"use client";

import React from "react";
import Link from "next/link";
import { LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface SidebarProps {
  title: string;
  items: SidebarItem[];
  currentPath: string;
  onSignOut: () => void;
  children?: React.ReactNode;
}

export function Sidebar({
  title,
  items,
  currentPath,
  onSignOut,
  children,
}: SidebarProps) {
  return (
    <aside className="flex h-full w-56 shrink-0 flex-col border-r bg-white">
      {/* Brand / title */}
      <div className="flex h-14 items-center border-b px-4">
        <span className="font-semibold text-sm text-zinc-900">{title}</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-0.5">
        {items.map(({ href, label, icon: Icon }) => {
          const active =
            currentPath === href || currentPath.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-zinc-100 text-zinc-900"
                  : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900",
              )}
            >
              <Icon className="size-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Extra children (e.g., user info) */}
      {children && <div className="px-2 pb-2">{children}</div>}

      {/* Sign out */}
      <div className="border-t px-2 py-3">
        <button
          onClick={onSignOut}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 transition-colors"
        >
          <LogOut className="size-4 shrink-0" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
