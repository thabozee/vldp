"use client";

/**
 * SPOC Overview — dashboard with stats and recent uploads
 * Requirements: 3.1, 3.8, 3.9
 */

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { AuthUser, Upload } from "@/lib/types";
import { UPLOADS } from "@/lib/mock-data/uploads";
import { Upload as UploadIcon, Clock, CheckCircle, Plus } from "lucide-react";

const STATUS_BADGE: Record<
  Upload["status"],
  {
    label: string;
    variant: "default" | "secondary" | "destructive" | "outline";
    className: string;
  }
> = {
  validating: {
    label: "Validating",
    variant: "secondary",
    className: "bg-zinc-100 text-zinc-700",
  },
  pending_payment: {
    label: "Pending Payment",
    variant: "outline",
    className: "bg-blue-50 text-blue-700 border-blue-200",
  },
  payment_pending: {
    label: "Pending Payment",
    variant: "outline",
    className: "bg-blue-50 text-blue-700 border-blue-200",
  },
  payment_failed: {
    label: "Payment Failed",
    variant: "destructive",
    className: "bg-red-50 text-red-700 border-red-200",
  },
  provisioning: {
    label: "Provisioning",
    variant: "secondary",
    className: "bg-yellow-50 text-yellow-700 border-yellow-200",
  },
  provisioned: {
    label: "Provisioned",
    variant: "default",
    className: "bg-green-50 text-green-700 border-green-200",
  },
  partial: {
    label: "Partial",
    variant: "outline",
    className: "bg-yellow-50 text-yellow-700 border-yellow-200",
  },
  cancelled: {
    label: "Cancelled",
    variant: "secondary",
    className: "bg-zinc-100 text-zinc-600",
  },
};

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-LS", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function SpocOverviewPage() {
  const params = useParams<{ institution: string }>();
  const institution_id = params.institution;
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);

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

  const myUploads = UPLOADS.filter(
    (u) => u.institutionId === user.institutionId && u.spocId === user.id,
  );

  const totalUploads = myUploads.length;
  const pendingPayment = myUploads.filter(
    (u) => u.status === "pending_payment" || u.status === "payment_pending",
  ).length;
  const provisioned = myUploads.filter(
    (u) => u.status === "provisioned" || u.status === "partial",
  ).length;

  const recentUploads = [...myUploads]
    .sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt))
    .slice(0, 5);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-zinc-900">
            Welcome back, {user.name.split(" ")[0]}
          </h1>
          <p className="text-sm text-zinc-500 mt-0.5">
            Here's your upload summary.
          </p>
        </div>
        <Link
          href={`/${institution_id}/spoc/upload`}
          className={cn(buttonVariants({ variant: "default" }))}
        >
          <Plus className="w-4 h-4 mr-1" />
          New Upload
        </Link>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-zinc-100">
                <UploadIcon className="w-5 h-5 text-zinc-600" />
              </div>
              <div>
                <p className="text-xs text-zinc-500">Total Uploads</p>
                <p className="text-2xl font-bold text-zinc-900">
                  {totalUploads}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-50">
                <Clock className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-zinc-500">Pending Payment</p>
                <p className="text-2xl font-bold text-zinc-900">
                  {pendingPayment}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-50">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-zinc-500">Provisioned</p>
                <p className="text-2xl font-bold text-zinc-900">
                  {provisioned}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent uploads */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Recent Uploads</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {recentUploads.length === 0 ? (
            <p className="text-sm text-zinc-500 px-6 pb-5">No uploads yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-zinc-500 text-xs">
                    <th className="px-6 py-3 text-left font-medium">
                      File Name
                    </th>
                    <th className="px-4 py-3 text-left font-medium">Status</th>
                    <th className="px-4 py-3 text-left font-medium">Date</th>
                    <th className="px-4 py-3 text-right font-medium">
                      Valid / Invalid
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {recentUploads.map((u) => {
                    const s = STATUS_BADGE[u.status];
                    return (
                      <tr key={u.id} className="hover:bg-zinc-50">
                        <td className="px-6 py-3 font-medium text-zinc-800 truncate max-w-[160px]">
                          {u.fileName}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${s.className}`}
                          >
                            {s.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-zinc-500">
                          {fmtDate(u.uploadedAt)}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className="text-green-700 font-medium">
                            {u.validRows}
                          </span>
                          <span className="text-zinc-400 mx-1">/</span>
                          <span className="text-red-600 font-medium">
                            {u.invalidRows}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
