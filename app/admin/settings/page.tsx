"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Institution } from "@/lib/types";

const V = { red: "#E60000" };

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

// Toggle switch component
function Toggle({
  checked,
  onChange,
  disabled,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => !disabled && onChange(!checked)}
      disabled={disabled}
      className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-40"
      style={
        {
          backgroundColor: checked ? V.red : "#D1D5DB",
          "--tw-ring-color": V.red,
        } as React.CSSProperties
      }
    >
      <span
        className="inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform"
        style={{ transform: checked ? "translateX(20px)" : "translateX(4px)" }}
      />
    </button>
  );
}

type LocationToggles = Record<string, Record<string, boolean>>; // institutionId → month → enabled

export default function AdminSettingsPage() {
  const [vodacomMerchant, setVodacomMerchant] = useState("+26657000001");
  const [maxRetries, setMaxRetries] = useState("3");
  const [timeoutSec, setTimeoutSec] = useState("90");
  const [saving, setSaving] = useState(false);
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [locationSearch, setLocationSearch] = useState("");
  // Bundle frequency: once | multiple per institution
  const [bundleFrequency, setBundleFrequency] = useState<
    Record<string, "once" | "multiple">
  >({});

  // Location notification toggles — keyed by institutionId → month index string
  const [locationToggles, setLocationToggles] = useState<LocationToggles>({});

  useEffect(() => {
    import("@/lib/mock-data/institutions").then(({ INSTITUTIONS }) => {
      setInstitutions(INSTITUTIONS);
      const initial: LocationToggles = {};
      const freq: Record<string, "once" | "multiple"> = {};
      for (const inst of INSTITUTIONS) {
        initial[inst.id] = {};
        MONTHS.forEach((_, i) => {
          initial[inst.id][i] = true;
        });
        freq[inst.id] = "once"; // default: once per month
      }
      setLocationToggles(initial);
      setBundleFrequency(freq);
    });
  }, []);

  function toggleMonth(instId: string, monthIdx: number) {
    setLocationToggles((prev) => ({
      ...prev,
      [instId]: { ...prev[instId], [monthIdx]: !prev[instId]?.[monthIdx] },
    }));
  }

  function toggleAllMonths(instId: string, value: boolean) {
    setLocationToggles((prev) => ({
      ...prev,
      [instId]: Object.fromEntries(MONTHS.map((_, i) => [i, value])),
    }));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await new Promise((r) => setTimeout(r, 600));
    setSaving(false);
    toast.success("Settings saved successfully");
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-xl font-semibold text-zinc-900">Settings</h1>
        <p className="text-sm text-zinc-500">Global system configuration</p>
      </div>

      <form onSubmit={handleSave} className="space-y-5">
        {/* M-Pesa */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">M-Pesa Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="merchant">Vodacom Lesotho Merchant MSISDN</Label>
              <Input
                id="merchant"
                value={vodacomMerchant}
                onChange={(e) => setVodacomMerchant(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="timeout">STK Push Timeout (seconds)</Label>
              <Input
                id="timeout"
                type="number"
                min="30"
                max="300"
                value={timeoutSec}
                onChange={(e) => setTimeoutSec(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Provisioning */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">
              Provisioning Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="retries">Maximum Retry Attempts per MSISDN</Label>
              <Input
                id="retries"
                type="number"
                min="1"
                max="10"
                value={maxRetries}
                onChange={(e) => setMaxRetries(e.target.value)}
              />
              <p className="text-xs text-zinc-400">
                MSISDNs that exceed this count will not be retried.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Location / Month toggles */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">
              Location Provisioning Schedule
            </CardTitle>
            <p className="text-xs text-zinc-500 mt-0.5">
              Enable or disable provisioning per institution per month. Set
              whether students can buy bundles <strong>once</strong> or{" "}
              <strong>multiple times</strong> per month.
            </p>
            {/* Search */}
            <div className="relative mt-3 max-w-xs">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                placeholder="Search institutions…"
                value={locationSearch}
                onChange={(e) => setLocationSearch(e.target.value)}
                className="w-full rounded-lg border border-zinc-200 pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2"
                style={{ "--tw-ring-color": V.red } as React.CSSProperties}
              />
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {institutions.length === 0 ? (
              <div className="h-8 w-full bg-zinc-100 rounded animate-pulse" />
            ) : (
              institutions
                .filter(
                  (inst) =>
                    !locationSearch.trim() ||
                    inst.name
                      .toLowerCase()
                      .includes(locationSearch.toLowerCase()) ||
                    inst.shortName
                      .toLowerCase()
                      .includes(locationSearch.toLowerCase()),
                )
                .map((inst) => {
                  const toggles = locationToggles[inst.id] ?? {};
                  const allOn = MONTHS.every((_, i) => toggles[i]);
                  const allOff = MONTHS.every((_, i) => !toggles[i]);
                  const freq = bundleFrequency[inst.id] ?? "once";

                  return (
                    <div key={inst.id} className="space-y-3">
                      {/* Institution header */}
                      <div className="flex items-center gap-3 flex-wrap">
                        <div
                          className="w-7 h-7 rounded-md flex items-center justify-center text-white text-[10px] font-bold shrink-0"
                          style={{ backgroundColor: inst.primaryColor }}
                        >
                          {inst.shortName.slice(0, 2)}
                        </div>
                        <p className="text-sm font-medium text-zinc-800">
                          {inst.name}
                        </p>
                        <span className="text-xs text-zinc-400 capitalize">
                          {inst.type}
                        </span>
                        <div className="ml-auto flex gap-2 flex-wrap">
                          <button
                            type="button"
                            onClick={() => toggleAllMonths(inst.id, true)}
                            className="text-[10px] font-medium px-2 py-0.5 rounded border transition-colors"
                            style={{
                              borderColor: allOn ? V.red : "#E0E0E0",
                              color: allOn ? V.red : "#888",
                            }}
                          >
                            All On
                          </button>
                          <button
                            type="button"
                            onClick={() => toggleAllMonths(inst.id, false)}
                            className="text-[10px] font-medium px-2 py-0.5 rounded border transition-colors"
                            style={{
                              borderColor: allOff ? "#888" : "#E0E0E0",
                              color: "#888",
                            }}
                          >
                            All Off
                          </button>
                        </div>
                      </div>

                      {/* Bundle frequency */}
                      <div className="flex items-center gap-3 bg-zinc-50 rounded-lg px-3 py-2">
                        <span className="text-xs font-medium text-zinc-600">
                          Bundles per month:
                        </span>
                        <div className="flex rounded-lg border border-zinc-200 overflow-hidden">
                          {(["once", "multiple"] as const).map((opt) => (
                            <button
                              key={opt}
                              type="button"
                              onClick={() =>
                                setBundleFrequency((prev) => ({
                                  ...prev,
                                  [inst.id]: opt,
                                }))
                              }
                              className="px-3 py-1 text-xs font-medium capitalize transition-colors"
                              style={{
                                backgroundColor: freq === opt ? V.red : "#fff",
                                color: freq === opt ? "#fff" : "#555",
                              }}
                            >
                              {opt === "once"
                                ? "Once / month"
                                : "Multiple / month"}
                            </button>
                          ))}
                        </div>
                        <span className="text-[10px] text-zinc-400 ml-1">
                          {freq === "once"
                            ? "Student can only purchase 1 bundle per month"
                            : "Student can purchase unlimited bundles per month"}
                        </span>
                      </div>

                      {/* Month toggles */}
                      <div className="grid grid-cols-6 sm:grid-cols-12 gap-2">
                        {MONTHS.map((month, i) => (
                          <div
                            key={month}
                            className="flex flex-col items-center gap-1"
                          >
                            <span className="text-[10px] font-medium text-zinc-500">
                              {month}
                            </span>
                            <Toggle
                              checked={!!toggles[i]}
                              onChange={() => toggleMonth(inst.id, i)}
                            />
                          </div>
                        ))}
                      </div>

                      <div className="border-b border-zinc-100" />
                    </div>
                  );
                })
            )}
          </CardContent>
        </Card>

        <Button
          type="submit"
          disabled={saving}
          className="text-white"
          style={{ backgroundColor: V.red }}
        >
          {saving ? "Saving…" : "Save Settings"}
        </Button>
      </form>
    </div>
  );
}
