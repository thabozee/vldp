"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Download } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const V = { red: "#E60000" };

type ReportType = "allocations" | "payments" | "provisioning" | "audit";

const REPORTS: { type: ReportType; title: string; description: string }[] = [
  {
    type: "allocations",
    title: "Allocations Report",
    description: "All data bundle allocations across all institutions",
  },
  {
    type: "payments",
    title: "Payments Report",
    description: "M-Pesa payment records (pending, success, failed)",
  },
  {
    type: "provisioning",
    title: "Provisioning Report",
    description: "Per-MSISDN provisioning results with error codes",
  },
  {
    type: "audit",
    title: "Audit Log Export",
    description: "Full system audit trail",
  },
];

async function downloadCSV(type: ReportType) {
  let rows: Record<string, unknown>[] = [];
  let filename = `vldp-${type}-${new Date().toISOString().slice(0, 10)}.csv`;

  if (type === "allocations") {
    const { ALLOCATIONS } = await import("@/lib/mock-data/allocations");
    rows = ALLOCATIONS.map((a) => ({
      id: a.id,
      studentId: a.studentId,
      msisdn: a.msisdn,
      institutionId: a.institutionId,
      bundleName: a.bundleName,
      bundleSize: a.bundleSize,
      source: a.source,
      validFrom: a.validFrom,
      validUntil: a.validUntil,
      createdAt: a.createdAt,
    }));
  } else if (type === "payments") {
    const { PAYMENTS } = await import("@/lib/mock-data/payments");
    rows = PAYMENTS.map((p) => ({
      id: p.id,
      uploadId: p.uploadId,
      institutionId: p.institutionId,
      amount: p.amount,
      status: p.status,
      mpesaReceiptNumber: p.mpesaReceiptNumber ?? "",
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    }));
  } else if (type === "provisioning") {
    const { PROVISIONING_RESULTS } =
      await import("@/lib/mock-data/provisioning");
    rows = PROVISIONING_RESULTS.map((r) => ({
      id: r.id,
      msisdn: r.msisdn,
      institutionId: r.institutionId,
      bundleId: r.bundleId,
      status: r.status,
      errorCode: r.errorCode ?? "",
      errorMessage: r.errorMessage ?? "",
      retryCount: r.retryCount,
      provisionedAt: r.provisionedAt ?? "",
      createdAt: r.createdAt,
    }));
  } else {
    const { AUDIT_LOG } = await import("@/lib/mock-data/audit-log");
    rows = AUDIT_LOG.map((e) => ({
      id: e.id,
      action: e.action,
      actorId: e.actorId,
      actorRole: e.actorRole,
      institutionId: e.institutionId,
      targetId: e.targetId ?? "",
      timestamp: e.timestamp,
    }));
  }

  if (rows.length === 0) {
    toast.error("No data to export.");
    return;
  }

  const headers = Object.keys(rows[0]);
  const csv = [
    headers.join(","),
    ...rows.map((r) =>
      headers.map((h) => JSON.stringify(r[h] ?? "")).join(","),
    ),
  ].join("\n");

  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
  toast.success(`Downloaded ${filename} (${rows.length} rows)`);
}

export default function AdminReportsPage() {
  const [loading, setLoading] = useState<ReportType | null>(null);

  async function handleDownload(type: ReportType) {
    setLoading(type);
    try {
      await downloadCSV(type);
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-zinc-900">Reports</h1>
        <p className="text-sm text-zinc-500">Export data as CSV</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {REPORTS.map(({ type, title, description }) => (
          <Card key={type}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">{title}</CardTitle>
              <p className="text-xs text-zinc-500">{description}</p>
            </CardHeader>
            <CardContent>
              <Button
                size="sm"
                onClick={() => handleDownload(type)}
                disabled={loading === type}
                className="w-full gap-2 text-white text-xs"
                style={{ backgroundColor: V.red }}
              >
                <Download className="w-3.5 h-3.5" />
                {loading === type ? "Exporting…" : "Download CSV"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
