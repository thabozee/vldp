"use client";

// Thin client-boundary wrapper for the Sonner Toaster.
// Imported by the root Server Component layout to avoid CJS require() errors
// from next-themes during SSR.

import { Toaster } from "@/components/ui/sonner";

export function ToasterClient() {
  return <Toaster richColors position="top-right" />;
}
