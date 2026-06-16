"use client";

/**
 * SPOC Upload History — paginated table with status badges
 * Requirements: 3.8, 3.9
 */

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UPLOADS } from "@/lib/mock-data/uploads";
import type { AuthUser, Upload } from "@/lib/types";
import { ChevronLeft, ChevronRight } from "lucide-react";

const PAGE_SIZE = 10;

const STATUS_STYLE: Record<Upload["status"], string> = {
  validating: "bg-zinc-100 text-zinc-700",
  pending_payment: "bg-blue-50 text-blue-700 border-blue-200",
  payment_pending: "bg-blue-50 text-blue-700 border-blue-200",
  payment_failed: "bg-red-50 text-red-700 border-red-200",
  provisioning: "bg-yellow-50 text-yellow-700 border-yellow-200",
  provisioned: "bg-green-50 text-green-700 border-green-200",
  partial: "bg-yellow-50 text-yellow-800 border-yellow-300",
  cancelled: "bg-zinc-100 text-zinc-500",
};

const STATUS_LABEL: Record<Upload["status"], string> = {
  validating: "Validating",
  pending_payment: "Pending Payment",
  payment_pending: "Pending Payment",
  payment_failed: "Payment Failed",
  provisioning: "Provisioning",
  provisioned: "Provisioned",
  partial: "Partial",
  cancelled: "Cancelled",
};

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-LS", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function SpocHistoryPage() {
  const params = useParams<{ institution: string }>();
  const institution_id = params.institution;
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("vldp_user");
      if (!stored) {
        router.replace(`/${institution_id}/login`);
        return;
      }
      const parsed = JSON.parse(stored) as AuthUser;
      if (parsed.role !== "spoc") {
        router.replace(`/${institution_id}/login`);
        return;
      }
      setUser(parsed);
    } catch {
      router.replace(`/${institution_id}/login`);
    }
  }, [institution_id, router]);

  if (!user) return null;

  const allUploads = UPLOADS.filter(
    (u) => u.institutionId === user.institutionId,
  ).sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt));

  const totalPages = Math.max(1, Math.ceil(allUploads.length / PAGE_SIZE));
  const paged = allUploads.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-xl font-semibold text-zinc-900">Upload History</h1>

      <Card>
        <CardContent className="p-0">
          {allUploads.length === 0 ? (
            <p className="text-sm text-zinc-500 px-6 py-8 text-center">
              No uploads found.
            </p>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-zinc-500 text-xs">
                      <th className="px-6 py-3 text-left font-medium">
                        File Name
                      </th>
                      <th className="px-4 py-3 text-right font-medium">
                        Total
                      </th>
                      <th className="px-4 py-3 text-right font-medium">
                        Valid
                      </th>
                      <th className="px-4 py-3 text-right font-medium">
                        Invalid
                      </th>
                      <th className="px-4 py-3 text-left font-medium">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left font-medium">Date</th>
                      <th className="px-4 py-3 text-left font-medium"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {paged.map((u) => (
                      <tr key={u.id} className="hover:bg-zinc-50">
                        <td className="px-6 py-3 font-medium text-zinc-800 truncate max-w-[160px]">
                          {u.fileName}
                        </td>
                        <td className="px-4 py-3 text-right text-zinc-600">
                          {u.totalRows}
                        </td>
                        <td className="px-4 py-3 text-right text-green-700 font-medium">
                          {u.validRows}
                        </td>
                        <td className="px-4 py-3 text-right text-red-600 font-medium">
                          {u.invalidRows}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${STATUS_STYLE[u.status]}`}
                          >
                            {STATUS_LABEL[u.status]}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-zinc-500">
                          {fmtDate(u.uploadedAt)}
                        </td>
                        <td className="px-4 py-3">
                          <Link
                            href={`/${institution_id}/admin/provisioning?uploadId=${u.id}`}
                            className="text-xs text-blue-600 hover:underline whitespace-nowrap"
                          >
                            View Details
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between px-6 py-3 border-t text-sm text-zinc-500">
                <span>
                  Page {page} of {totalPages}
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => p - 1)}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
