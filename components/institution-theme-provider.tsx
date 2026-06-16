"use client";

/**
 * InstitutionThemeProvider
 *
 * Applies the --institution-primary CSS variable to a wrapping <div> and
 * exposes institution branding data to all child components via React context.
 *
 * Requirements: 1.1, 1.2, 1.3, 1.4, 1.5
 */

import React, { createContext } from "react";
import type { InstitutionBranding, InstitutionContextValue } from "@/lib/types";

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

export const InstitutionContext = createContext<InstitutionContextValue | null>(
  null,
);

// ---------------------------------------------------------------------------
// Provider component
// ---------------------------------------------------------------------------

interface InstitutionThemeProviderProps {
  institution: InstitutionBranding;
  children: React.ReactNode;
}

export function InstitutionThemeProvider({
  institution,
  children,
}: InstitutionThemeProviderProps) {
  const value: InstitutionContextValue = {
    institution,
    isLoading: false,
  };

  return (
    <InstitutionContext.Provider value={value}>
      {/* Apply the institution's primary colour as a CSS variable so
          Tailwind's `bg-institution-primary` (and similar) picks it up. */}
      <div
        style={
          {
            "--institution-primary": institution.primaryColor,
          } as React.CSSProperties
        }
        className="contents"
      >
        {children}
      </div>
    </InstitutionContext.Provider>
  );
}
