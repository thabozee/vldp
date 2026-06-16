import React from "react";
import Link from "next/link";

interface NavbarProps {
  institutionName?: string;
  rightContent?: React.ReactNode;
}

export function Navbar({ institutionName, rightContent }: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-white shadow-sm">
      <div className="flex h-14 items-center gap-4 px-4 sm:px-6">
        {/* Logo / brand */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <span className="font-bold text-lg tracking-tight text-[var(--institution-primary,#E60000)]">
            VLAP
          </span>
          {institutionName && (
            <>
              <span className="text-zinc-300">|</span>
              <span className="text-sm font-medium text-zinc-700 hidden sm:inline">
                {institutionName}
              </span>
            </>
          )}
        </Link>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Right slot */}
        {rightContent && (
          <div className="flex items-center gap-2">{rightContent}</div>
        )}
      </div>
    </header>
  );
}
