"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface ConsentToggleProps {
  consentGiven: boolean;
  optIn: boolean;
  onConsentChange: (v: boolean) => void;
  onOptInChange: (v: boolean) => void;
  disabled?: boolean;
}

export function ConsentToggle({
  consentGiven,
  optIn,
  onConsentChange,
  onOptInChange,
  disabled = false,
}: ConsentToggleProps) {
  return (
    <div className="space-y-3">
      {/* Data consent */}
      <label
        className={cn(
          "flex items-start gap-3 cursor-pointer",
          disabled && "opacity-50 cursor-not-allowed",
        )}
      >
        <input
          type="checkbox"
          checked={consentGiven}
          onChange={(e) => onConsentChange(e.target.checked)}
          disabled={disabled}
          className="mt-0.5 h-4 w-4 rounded border-zinc-300 accent-[var(--institution-primary,#E60000)]"
        />
        <div>
          <p className="text-sm font-medium text-zinc-900">Data consent</p>
          <p className="text-xs text-muted-foreground">
            I consent to my data being used for provisioning purposes.
          </p>
        </div>
      </label>

      {/* Opt-in for data allocation */}
      <label
        className={cn(
          "flex items-start gap-3 cursor-pointer",
          disabled && "opacity-50 cursor-not-allowed",
        )}
      >
        <input
          type="checkbox"
          checked={optIn}
          onChange={(e) => onOptInChange(e.target.checked)}
          disabled={disabled}
          className="mt-0.5 h-4 w-4 rounded border-zinc-300 accent-[var(--institution-primary,#E60000)]"
        />
        <div>
          <p className="text-sm font-medium text-zinc-900">
            Opt in to data allocation
          </p>
          <p className="text-xs text-muted-foreground">
            I would like to receive mobile data allocations from my institution.
          </p>
        </div>
      </label>
    </div>
  );
}
