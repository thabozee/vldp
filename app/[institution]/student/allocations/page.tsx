"use client";

/**
 * Student Allocation History
 * Requirements: 9.3, 8.6
 */

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getAllocationsByStudentId } from "@/lib/mock-data/allocations";
import { getStudentByUserId } from "@/lib/mock-data/students";
import type { AuthUser, Allocation } from "@/lib/types";
import { PackageOpen } from "lucide-react";

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-LS", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function StudentAllocationsPage() {
  const params = useParams<{ institution: string }>();
  const institution_id = params.institution;
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [allocations, setAllocations] = useState<Allocation[]>([]);

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

      const student = getStudentByUserId(parsed.id);
      if (student) {
        const allocs = getAllocationsByStudentId(student.id);
        setAllocations(allocs);
      }
    } catch {
      router.replace(`/${institution_id}/login`);
    }
  }, [institution_id, router]);

  if (!user) return null;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-xl font-semibold text-zinc-900">My Allocations</h1>

      {allocations.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
            <PackageOpen className="w-10 h-10 text-zinc-300" />
            <p className="text-sm font-medium text-zinc-500">
              No allocations yet
            </p>
            <p className="text-xs text-zinc-400">
              Your data bundles will appear here once provisioned.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {allocations.map((a) => (
            <Card key={a.id}>
              <CardContent className="pt-4 pb-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-zinc-900">
                        {a.bundleName}
                      </p>
                      <Badge variant="outline" className="text-xs">
                        {a.bundleSize}
                      </Badge>
                      <Badge
                        variant="secondary"
                        className={`text-xs ${
                          a.source === "spoc_upload"
                            ? "bg-blue-50 text-blue-700 border-blue-200"
                            : "bg-purple-50 text-purple-700 border-purple-200"
                        }`}
                      >
                        {a.source === "spoc_upload"
                          ? "SPOC Upload"
                          : "Self Purchase"}
                      </Badge>
                    </div>
                    <p className="text-xs text-zinc-500 mt-1">
                      Valid: {fmtDate(a.validFrom)} — {fmtDate(a.validUntil)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
