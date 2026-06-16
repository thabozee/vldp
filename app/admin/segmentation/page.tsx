"use client";

import { useEffect, useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Student } from "@/lib/types";

export default function AdminSegmentationPage() {
  const [students, setStudents] = useState<Student[]>([]);

  useEffect(() => {
    import("@/lib/mock-data/students").then(({ STUDENTS }) =>
      setStudents(STUDENTS),
    );
  }, []);

  const byTier: Record<string, number> = useMemo(() => {
    // We'd need institution data — approximate via institutionId prefixes
    const tertiary = ["nul", "limkokwing", "botho", "lerotholi"];
    const secondary = ["qoaling", "abia"];
    const groups: Record<string, number> = {
      Tertiary: 0,
      Secondary: 0,
      Primary: 0,
    };
    for (const s of students) {
      if (tertiary.includes(s.institutionId)) groups["Tertiary"]++;
      else if (secondary.includes(s.institutionId)) groups["Secondary"]++;
      else groups["Primary"]++;
    }
    return groups;
  }, [students]);

  const byConsent = useMemo(
    () => ({
      "Consent Given": students.filter((s) => s.consentGiven).length,
      "No Consent": students.filter((s) => !s.consentGiven).length,
    }),
    [students],
  );

  const byOptIn = useMemo(
    () => ({
      "Opted In": students.filter((s) => s.optIn).length,
      "Opted Out": students.filter((s) => !s.optIn).length,
    }),
    [students],
  );

  const byStatus = useMemo(() => {
    const groups: Record<string, number> = {};
    for (const s of students) {
      groups[s.status] = (groups[s.status] ?? 0) + 1;
    }
    return groups;
  }, [students]);

  const groups = [
    { title: "By Institution Tier", data: byTier },
    { title: "By Consent", data: byConsent },
    { title: "By Opt-In", data: byOptIn },
    { title: "By Status", data: byStatus },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-zinc-900">Segmentation</h1>
        <p className="text-sm text-zinc-500">
          Student breakdown across all institutions
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {groups.map(({ title, data }) => (
          <Card key={title}>
            <CardHeader>
              <CardTitle className="text-sm">{title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {Object.entries(data).map(([label, count]) => (
                <div key={label} className="flex items-center gap-3">
                  <div className="flex-1 text-sm text-zinc-700">{label}</div>
                  <div className="w-32 h-2 rounded-full bg-zinc-100 overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        backgroundColor: "#E60000",
                        width: `${Math.min(100, (count / Math.max(students.length, 1)) * 100)}%`,
                      }}
                    />
                  </div>
                  <span className="text-sm font-semibold text-zinc-900 w-8 text-right">
                    {count}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
