"use client";

/**
 * Admin Reports page
 *
 * Export buttons for CSV/PDF (mock: triggers browser download of JSON-as-CSV).
 *
 * Requirements: 13.8, 16.1–16.3
 */

import { useState } from "react";
import { toast } from "sonner";
import { Download, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ReportDef {
  id: string;
  title: string;
  description: string;
  formats: ("csv" | "pdf")[];
  dataKey: "allocations" | "payments" | "provisioning";
}

const REPORTS: ReportDef[] = [
  {
    id: "allocations",
    title: "Allocations Report",
    description: "All data bundle allocations with student and bundle details.",
    formats: ["csv", "pdf"],
    dataKey: "allocations",
  },
  {
    id: "payments",
    title: "Payments Report",
    description: "All M-Pesa payment transactions with status and amounts.",
    formats: ["csv", "pdf"],
    dataKey: "payments",
  },
  {
    id: "provisioning",
    title: "Provisioning Report",
    description: "All provisioning results including errors and retry counts.",
    formats: ["csv", "pdf"],
    dataKey: "provisioning",
  },
];

async function loadData(
  key: ReportDef["dataKey"],
): Promise<Record<string, unknown>[]> {
  switch (key) {
    case "allocations": {
      const { ALLOCATIONS } = await import("@/lib/mock-data/allocations");
      return ALLOCATIONS as unknown as Record<string, unknown>[];
    }
    case "payments": {
      const { PAYMENTS } = await import("@/lib/mock-data/payments");
      return PAYMENTS as unknown as Record<string, unknown>[];
    }
    case "provisioning": {
      const { PROVISIONING_RESULTS } =
        await import("@/lib/mock-data/provisioning");
      return PROVISIONING_RESULTS as unknown as Record<string, unknown>[];
    }
  }
}

function toCSV(rows: Record<string, unknown>[]): string {
  if (rows.length === 0) return "";
  const headers = Object.keys(rows[0]);
  const lines = [
    headers.join(","),
    ...rows.map((row) =>
      headers
        .map((h) => {
          const val = row[h];
          if (val === null || val === undefined) return "";
          const str = String(val);
          // Escape commas and quotes
          if (str.includes(",") || str.includes('"') || str.includes("\n")) {
            return `"${str.replace(/"/g, '""')}"`;
          }
          return str;
        })
        .join(","),
    ),
  ];
  return lines.join("\n");
}

function downloadFile(filename: string, content: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default function AdminReportsPage() {
  const [exporting, setExporting] = useState<Record<string, boolean>>({});

  const handleExport = async (report: ReportDef, format: "csv" | "pdf") => {
    const key = `${report.id}-${format}`;
    setExporting((prev) => ({ ...prev, [key]: true }));

    try {
      const data = await loadData(report.dataKey);
      const timestamp = new Date().toISOString().slice(0, 10);
      const filename = `${report.dataKey}-${timestamp}.${format === "csv" ? "csv" : "json"}`;

      if (format === "csv") {
        const csv = toCSV(data);
        downloadFile(filename, csv, "text/csv");
        toast.success(`${report.title} exported as CSV (${data.length} rows).`);
      } else {
        // PDF mock: download as JSON (real PDF generation requires server-side library)
        const json = JSON.stringify(data, null, 2);
        downloadFile(filename, json, "application/json");
        toast.info(
          `${report.title} exported (mock PDF as JSON — ${data.length} records).`,
        );
      }
    } catch (err) {
      toast.error("Export failed.");
      console.error(err);
    } finally {
      setExporting((prev) => ({ ...prev, [key]: false }));
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-zinc-900">Reports</h1>
        <p className="text-sm text-zinc-500 mt-0.5">
          Export data for allocations, payments, and provisioning.
        </p>
      </div>

      <div className="grid gap-4">
        {REPORTS.map((report) => (
          <Card key={report.id}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <CardTitle className="text-sm font-semibold">
                    {report.title}
                  </CardTitle>
                  <p className="text-xs text-zinc-500 mt-1">
                    {report.description}
                  </p>
                </div>
                <FileText className="w-5 h-5 text-zinc-400 shrink-0 mt-0.5" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 flex-wrap">
                {report.formats.map((fmt) => {
                  const key = `${report.id}-${fmt}`;
                  const isLoading = exporting[key];
                  return (
                    <Button
                      key={fmt}
                      variant="outline"
                      size="sm"
                      disabled={isLoading}
                      onClick={() => handleExport(report, fmt)}
                    >
                      <Download className="w-3.5 h-3.5 mr-1.5" />
                      {isLoading ? "Exporting…" : `Export ${fmt.toUpperCase()}`}
                      {fmt === "pdf" && (
                        <Badge variant="secondary" className="ml-1.5 text-xs">
                          mock
                        </Badge>
                      )}
                    </Button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
