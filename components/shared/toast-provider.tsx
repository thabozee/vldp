"use client";

import { Toaster } from "@/components/ui/sonner";
export { toast as useToast } from "sonner";

export function ToastProvider() {
  return <Toaster richColors position="top-right" />;
}
