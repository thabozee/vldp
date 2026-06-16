"use client";

/**
 * Admin Segmentation page
 *
 * Groups students by institution tier, opt-in status, consent status.
 * Summary stats per group.
 *
 * Requirements: 13.6
 */

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { STUDENTS } from "@/lib/mock-data/students";
import { INSTITUTIONS } from "@/lib/mock-data/institutions";

interface SegmentGroup {
  label: string;
  description: string;
  count: number;
  percentage: number;
  variant: "default" | "secondary" | "outline" | "destructive";
}

export default function AdminSegmentationPage() {
  const { byTier, byOptIn, byConsent, byStatus } = useMemo(() => {
    const total = STUDENTS.length;

    // Build institution tier map
    const tierMap = new Map<string, "tertiary" | "secondary" | "primary">();
    INSTITUTIONS.forEach((i) => tierMap.set(i.id, i.type));

    const countPct = (n: number) => ({
      count: n,
      percentage: Math.round((n / total) * 100),
    });

    // By tier
    const tertiary = STUDENTS.filter(
      (s) => tierMap.get(s.institutionId) === "tertiary",
    ).length;
    const secondary = STUDENTS.filter(
      (s) => tierMap.get(s.institutionId) === "secondary",
    ).length;
    const primary = STUDENTS.filter(
      (s) => tierMap.get(s.institutionId) === "primary",
    ).length;

    // By opt-in
    const optedIn = STUDENTS.filter((s) => s.optIn).length;
    const optedOut = STUDENTS.filter((s) => !s.optIn).length;

    // By consent
    const consentGiven = STUDENTS.filter((s) => s.consentGiven).length;
    const consentNotGiven = STUDENTS.filter((s) => !s.consentGiven).length;

    // By status
    const active = STUDENTS.filter((s) => s.status === "active").length;
    const suspended = STUDENTS.filter((s) => s.status === "suspended").length;
    const pending = STUDENTS.filter(
      (s) => s.status === "pending_registration",
    ).length;

    return {
      byTier: [
        {
          label: "Tertiary",
          description: "University-level students",
          ...countPct(tertiary),
          variant: "default" as const,
        },
        {
          label: "Secondary",
          description: "Secondary school students",
          ...countPct(secondary),
          variant: "secondary" as const,
        },
        {
          label: "Primary",
          description: "Primary school students",
          ...countPct(primary),
          variant: "outline" as const,
        },
      ] as SegmentGroup[],
      byOptIn: [
        {
          label: "Opted In",
          description: "Agreed to receive data bundles",
          ...countPct(optedIn),
          variant: "default" as const,
        },
        {
          label: "Opted Out",
          description: "Declined data bundle offers",
          ...countPct(optedOut),
          variant: "secondary" as const,
        },
      ] as SegmentGroup[],
      byConsent: [
        {
          label: "Consent Given",
          description: "Consented to provisioning",
          ...countPct(consentGiven),
          variant: "default" as const,
        },
        {
          label: "No Consent",
          description: "Has not given consent",
          ...countPct(consentNotGiven),
          variant: "destructive" as const,
        },
      ] as SegmentGroup[],
      byStatus: [
        {
          label: "Active",
          description: "Active students",
          ...countPct(active),
          variant: "default" as const,
        },
        {
          label: "Suspended",
          description: "Suspended accounts",
          ...countPct(suspended),
          variant: "destructive" as const,
        },
        {
          label: "Pending",
          description: "Awaiting registration completion",
          ...countPct(pending),
          variant: "secondary" as const,
        },
      ] as SegmentGroup[],
    };
  }, []);

  function SegmentCard({ group }: { group: SegmentGroup }) {
    return (
      <div className="flex items-center justify-between p-3 rounded-lg border border-zinc-100 bg-white">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant={group.variant}>{group.label}</Badge>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">{group.description}</p>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold text-zinc-900">{group.count}</p>
          <p className="text-xs text-zinc-400">{group.percentage}%</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-zinc-900">Segmentation</h1>
        <p className="text-sm text-zinc-500 mt-0.5">
          {STUDENTS.length} total students across all institutions
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* By Tier */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">By Institution Tier</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {byTier.map((g) => (
              <SegmentCard key={g.label} group={g} />
            ))}
          </CardContent>
        </Card>

        {/* By Opt-In */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">By Opt-In Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {byOptIn.map((g) => (
              <SegmentCard key={g.label} group={g} />
            ))}
          </CardContent>
        </Card>

        {/* By Consent */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">By Consent Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {byConsent.map((g) => (
              <SegmentCard key={g.label} group={g} />
            ))}
          </CardContent>
        </Card>

        {/* By Account Status */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">By Account Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {byStatus.map((g) => (
              <SegmentCard key={g.label} group={g} />
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
