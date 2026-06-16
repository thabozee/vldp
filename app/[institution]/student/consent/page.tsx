"use client";

/**
 * Student consent & opt-in preferences
 * Requirements: 8.3, 8.4
 */

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getStudentByUserId } from "@/lib/mock-data/students";
import type { AuthUser } from "@/lib/types";
import { CheckCircle, Loader2 } from "lucide-react";

export default function StudentConsentPage() {
  const params = useParams<{ institution: string }>();
  const institution_id = params.institution;
  const router = useRouter();

  const [user, setUser] = useState<AuthUser | null>(null);
  const [consent, setConsent] = useState(false);
  const [optIn, setOptIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("vldp_user");
      if (!stored) {
        router.replace(`/${institution_id}/login`);
        return;
      }
      const parsed = JSON.parse(stored) as AuthUser;
      if (parsed.role !== "student") {
        router.replace(`/${institution_id}/login`);
        return;
      }
      setUser(parsed);

      // Pre-fill from student record
      const s = getStudentByUserId(parsed.id);
      if (s) {
        setConsent(s.consentGiven);
        setOptIn(s.optIn);
      }
    } catch {
      router.replace(`/${institution_id}/login`);
    }
  }, [institution_id, router]);

  if (!user) return null;

  async function handleSave() {
    if (!user) return;
    setLoading(true);
    setError(null);

    const token = (JSON.parse(localStorage.getItem("vldp_user")!) as AuthUser)
      .token;

    try {
      const [consentRes, optInRes] = await Promise.all([
        fetch("/api/students/consent", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ studentId: user.id, consentGiven: consent }),
        }),
        fetch("/api/students/opt-in", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ studentId: user.id, optIn }),
        }),
      ]);

      if (!consentRes.ok || !optInRes.ok) {
        setError("Failed to save preferences. Please try again.");
        return;
      }

      setSaved(true);
      setTimeout(() => {
        router.push(`/${institution_id}/student`);
      }, 1500);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-lg mx-auto space-y-6 py-8">
      <div>
        <h1 className="text-xl font-semibold text-zinc-900">
          Consent & Preferences
        </h1>
        <p className="text-sm text-zinc-500 mt-1">
          Review and save your data preferences.
        </p>
      </div>

      <Card>
        <CardContent className="pt-5 space-y-5">
          {/* Consent checkbox */}
          <label className="flex items-start gap-3 cursor-pointer group">
            <input
              type="checkbox"
              className="mt-0.5 h-4 w-4 rounded accent-zinc-800"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              disabled={loading}
            />
            <div>
              <p className="text-sm font-medium text-zinc-800">
                Data usage consent
              </p>
              <p className="text-xs text-zinc-500 mt-0.5">
                I consent to Vodacom Lesotho using my personal data for the
                purposes of data bundle provisioning as part of the VLDP
                programme.
              </p>
            </div>
          </label>

          {/* Opt-in toggle */}
          <div className="flex items-start gap-3">
            <button
              role="switch"
              aria-checked={optIn}
              disabled={loading}
              onClick={() => setOptIn((v) => !v)}
              className={`mt-0.5 relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-zinc-400 shrink-0 ${
                optIn ? "bg-zinc-900" : "bg-zinc-300"
              }`}
            >
              <span
                className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${optIn ? "translate-x-4" : "translate-x-0.5"}`}
              />
            </button>
            <div>
              <p className="text-sm font-medium text-zinc-800">
                Receive data allocations
              </p>
              <p className="text-xs text-zinc-500 mt-0.5">
                Opt in to receive data allocations from my institution through
                the VLDP programme.
              </p>
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          {saved ? (
            <div className="flex items-center gap-2 text-green-600 text-sm">
              <CheckCircle className="w-4 h-4" />
              Preferences saved! Redirecting…
            </div>
          ) : (
            <Button className="w-full" onClick={handleSave} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving…
                </>
              ) : (
                "Save Preferences"
              )}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
