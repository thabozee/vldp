"use client";

/**
 * Admin Settings page
 *
 * Form to update merchant MSISDN and active bundle.
 * Save button with success toast.
 *
 * Requirements: 13.9
 */

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminSettingsPage() {
  const params = useParams<{ institution: string }>();
  const institution = params?.institution ?? "";

  const [merchantMsisdn, setMerchantMsisdn] = useState("");
  const [activeBundle, setActiveBundle] = useState("");
  const [bundles, setBundles] = useState<Array<{ id: string; name: string }>>(
    [],
  );
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // Load institution settings and bundles on mount
  useEffect(() => {
    if (!institution) return;

    Promise.all([
      import("@/lib/mock-data/institutions").then(({ getInstitutionById }) =>
        getInstitutionById(institution),
      ),
      import("@/lib/mock-data/bundles").then(({ BUNDLES }) => BUNDLES),
    ]).then(([inst, allBundles]) => {
      if (inst) {
        setMerchantMsisdn(inst.merchantMSISDN);
      }
      setBundles(
        allBundles
          .filter((b) => b.active)
          .map((b) => ({ id: b.id, name: b.name })),
      );
      setLoaded(true);
    });
  }, [institution]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!merchantMsisdn.trim()) {
      toast.error("Merchant MSISDN is required.");
      return;
    }

    setSaving(true);
    // Simulate async save
    await new Promise((r) => setTimeout(r, 400));
    setSaving(false);

    toast.success("Settings saved successfully.");
  };

  if (!loaded) {
    return (
      <div className="space-y-4">
        <div className="h-6 w-32 bg-zinc-200 rounded animate-pulse" />
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="h-10 bg-zinc-100 rounded animate-pulse" />
            <div className="h-10 bg-zinc-100 rounded animate-pulse" />
            <div className="h-9 w-24 bg-zinc-100 rounded animate-pulse" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-lg">
      <div>
        <h1 className="text-xl font-semibold text-zinc-900">Settings</h1>
        <p className="text-sm text-zinc-500 mt-0.5">
          Configure institution-level portal settings.
        </p>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-sm">Institution Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-4">
            {/* Merchant MSISDN */}
            <div className="space-y-1.5">
              <Label htmlFor="merchant-msisdn">Merchant MSISDN</Label>
              <Input
                id="merchant-msisdn"
                type="tel"
                value={merchantMsisdn}
                onChange={(e) => setMerchantMsisdn(e.target.value)}
                placeholder="+26657XXXXXXX"
              />
              <p className="text-xs text-zinc-400">
                The M-Pesa merchant number payments are collected against.
              </p>
            </div>

            {/* Active bundle */}
            <div className="space-y-1.5">
              <Label htmlFor="active-bundle">Active Bundle</Label>
              <select
                id="active-bundle"
                value={activeBundle}
                onChange={(e) => setActiveBundle(e.target.value)}
                className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-400"
              >
                <option value="">— Select bundle —</option>
                {bundles.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
              <p className="text-xs text-zinc-400">
                Default bundle applied to new SPOC uploads.
              </p>
            </div>

            <Button type="submit" disabled={saving}>
              {saving ? "Saving…" : "Save Settings"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
