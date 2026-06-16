"use client";

/**
 * Global Admin — Provisioning view with fully functional retry.
 * Shows all provisioning results across all institutions.
 * Allows selecting failed rows and retrying them via /api/provisioning/retry.
 */

import { useEffect, useState, useMemo } from "react";
import { toast } from "sonner";
import {
  RefreshCw,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { ProvisioningResult } from "@/lib/types";

const V = { red: "#E60000" };

type StatusFilter = "all" | "success" | "failed" | "retrying" | "pending";

const STATUS_COLORS: Record<string, string> = {
  success: "bg-green-100 text-green-700 border-green-200",
  failed: "bg-red-100 text-red-700 border-red-200",
  retrying: "bg-yellow-100 text-yellow-700 border-yellow-200",
  pending: "bg-blue-100 text-blue-700 border-blue-200",
};

const STATUS_ICONS: Record<string, React.ReactNode> = {
  success: <CheckCircle2 className="w-3.5 h-3.5" />,
  failed: <XCircle className="w-3.5 h-3.5" />,
  retrying: <RefreshCw className="w-3.5 h-3.5" />,
  pending: <Clock className="w-3.5 h-3.5" />,
};

const PAGE_SIZE = 25;

export default function AdminProvisioningPage() {
  const [results, setResults] = useState<ProvisioningResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [instFilter, setInstFilter] = useState("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [retrying, setRetrying] = useState(false);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const t = setTimeout(async () => {
      const { PROVISIONING_RESULTS } =
        await import("@/lib/mock-data/provisioning");
      setResults([...PROVISIONING_RESULTS]);
      setLoading(false);
    }, 400);
    return () => clearTimeout(t);
  }, []);

  const institutions = useMemo(() => {
    const ids = new Set(results.map((r) => r.institutionId));
    return ["all", ...Array.from(ids)];
  }, [results]);

  const filtered = useMemo(() => {
    return results.filter((r) => {
      if (filter !== "all" && r.status !== filter) return false;
      if (instFilter !== "all" && r.institutionId !== instFilter) return false;
      return true;
    });
  }, [results, filter, instFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const failedItems = filtered.filter(
    (r) => r.status === "failed" && r.retryCount < 3,
  );

  function toggleAll() {
    if (selected.size === failedItems.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(failedItems.map((r) => r.id)));
    }
  }

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function handleRetry() {
    const toRetry = results.filter(
      (r) => selected.has(r.id) && r.status === "failed",
    );
    if (toRetry.length === 0) return;

    // Group by uploadId
    const byUpload = new Map<string, string[]>();
    for (const r of toRetry) {
      const list = byUpload.get(r.uploadId) ?? [];
      list.push(r.msisdn);
      byUpload.set(r.uploadId, list);
    }

    setRetrying(true);
    let totalSucceeded = 0;
    let totalFailed = 0;

    try {
      const user = JSON.parse(localStorage.getItem("vldp_user") ?? "{}");
      for (const [uploadId, msisdns] of byUpload.entries()) {
        const res = await fetch("/api/provisioning/retry", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token ?? ""}`,
          },
          body: JSON.stringify({ msisdns, uploadId }),
        });
        if (res.ok) {
          const data = (await res.json()) as {
            result?: { succeeded: number; failed: number };
          };
          totalSucceeded += data.result?.succeeded ?? 0;
          totalFailed += data.result?.failed ?? 0;
        }
      }

      // Refresh results from store
      const { PROVISIONING_RESULTS } =
        await import("@/lib/mock-data/provisioning");
      setResults([...PROVISIONING_RESULTS]);
      setSelected(new Set());

      if (totalSucceeded > 0) {
        toast.success(
          `Retry complete: ${totalSucceeded} provisioned, ${totalFailed} still failed`,
        );
      } else {
        toast.error(`All ${totalFailed} retries failed. Check error codes.`);
      }
    } catch {
      toast.error("Retry request failed. Please try again.");
    } finally {
      setRetrying(false);
    }
  }

  const summary = {
    success: results.filter((r) => r.status === "success").length,
    failed: results.filter((r) => r.status === "failed").length,
    retrying: results.filter((r) => r.status === "retrying").length,
    pending: results.filter((r) => r.status === "pending").length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-zinc-900">Provisioning</h1>
        <p className="text-sm text-zinc-500">
          All institutions — per-MSISDN results
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {(["success", "failed", "retrying", "pending"] as const).map((s) => (
          <Card
            key={s}
            className={`cursor-pointer border-2 transition-all ${filter === s ? "border-red-500" : "border-transparent"}`}
            onClick={() => {
              setFilter(filter === s ? "all" : s);
              setPage(1);
            }}
          >
            <CardHeader className="pb-1">
              <CardTitle className="text-xs capitalize text-zinc-500 flex items-center gap-1.5">
                {STATUS_ICONS[s]} {s}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p
                className="text-2xl font-bold"
                style={{
                  color:
                    s === "success"
                      ? "#16a34a"
                      : s === "failed"
                        ? V.red
                        : s === "retrying"
                          ? "#d97706"
                          : "#2563eb",
                }}
              >
                {loading ? "…" : summary[s].toLocaleString()}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="flex gap-2 flex-wrap">
          {/* Status filter */}
          <div className="flex rounded-lg border border-zinc-200 overflow-hidden">
            {(["all", "success", "failed", "retrying", "pending"] as const).map(
              (s) => (
                <button
                  key={s}
                  onClick={() => {
                    setFilter(s);
                    setPage(1);
                  }}
                  className="px-3 py-1.5 text-xs font-medium capitalize transition-colors"
                  style={{
                    backgroundColor: filter === s ? V.red : "#fff",
                    color: filter === s ? "#fff" : "#555",
                  }}
                >
                  {s}
                </button>
              ),
            )}
          </div>

          {/* Institution filter */}
          <select
            value={instFilter}
            onChange={(e) => {
              setInstFilter(e.target.value);
              setPage(1);
            }}
            className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs focus:outline-none"
          >
            {institutions.map((i) => (
              <option key={i} value={i}>
                {i === "all" ? "All Institutions" : i}
              </option>
            ))}
          </select>
        </div>

        {/* Retry button */}
        {selected.size > 0 && (
          <Button
            onClick={handleRetry}
            disabled={retrying}
            size="sm"
            className="text-white text-xs gap-1.5"
            style={{ backgroundColor: V.red }}
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${retrying ? "animate-spin" : ""}`}
            />
            {retrying ? "Retrying…" : `Retry ${selected.size} selected`}
          </Button>
        )}
      </div>

      {/* Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-zinc-50 text-left">
                <th className="px-4 py-3 w-10">
                  <input
                    type="checkbox"
                    checked={
                      selected.size > 0 && selected.size === failedItems.length
                    }
                    onChange={toggleAll}
                    className="rounded"
                    style={{ accentColor: V.red }}
                    title="Select all failed"
                  />
                </th>
                <th className="px-4 py-3 font-medium text-zinc-600 text-xs">
                  MSISDN
                </th>
                <th className="px-4 py-3 font-medium text-zinc-600 text-xs">
                  Institution
                </th>
                <th className="px-4 py-3 font-medium text-zinc-600 text-xs">
                  Bundle
                </th>
                <th className="px-4 py-3 font-medium text-zinc-600 text-xs">
                  Status
                </th>
                <th className="px-4 py-3 font-medium text-zinc-600 text-xs">
                  Retries
                </th>
                <th className="px-4 py-3 font-medium text-zinc-600 text-xs">
                  Error
                </th>
                <th className="px-4 py-3 font-medium text-zinc-600 text-xs">
                  Date
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i} className="border-b">
                    {Array.from({ length: 8 }).map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 bg-zinc-100 rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : paged.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-12 text-center text-zinc-400 text-sm"
                  >
                    No results match the current filter.
                  </td>
                </tr>
              ) : (
                paged.map((r) => {
                  const isFailed = r.status === "failed" && r.retryCount < 3;
                  const isSelected = selected.has(r.id);
                  return (
                    <tr
                      key={r.id}
                      className={`border-b hover:bg-zinc-50 transition-colors ${isSelected ? "bg-red-50" : ""}`}
                    >
                      <td className="px-4 py-3">
                        {isFailed && (
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggle(r.id)}
                            className="rounded"
                            style={{ accentColor: V.red }}
                          />
                        )}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs">
                        {r.msisdn}
                      </td>
                      <td className="px-4 py-3 text-xs text-zinc-600">
                        {r.institutionId}
                      </td>
                      <td className="px-4 py-3 text-xs text-zinc-600">
                        {r.bundleId.replace("bundle-", "")}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium ${STATUS_COLORS[r.status] ?? ""}`}
                        >
                          {STATUS_ICONS[r.status]} {r.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-zinc-500 text-center">
                        {r.retryCount}
                        {r.retryCount >= 3 && (
                          <span title="Max retries reached">
                            {" "}
                            <AlertCircle className="w-3 h-3 text-red-400 inline ml-1" />
                          </span>
                        )}
                      </td>
                      <td
                        className="px-4 py-3 text-xs text-zinc-500 max-w-xs truncate"
                        title={r.errorMessage}
                      >
                        {r.errorCode ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-xs text-zinc-400">
                        {r.provisionedAt
                          ? new Date(r.provisionedAt).toLocaleDateString()
                          : new Date(r.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t">
            <p className="text-xs text-zinc-500">
              {filtered.length} results · Page {page} of {totalPages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1 text-xs border rounded disabled:opacity-40"
              >
                ← Prev
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1 text-xs border rounded disabled:opacity-40"
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
