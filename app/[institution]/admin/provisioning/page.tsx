"use client";

/**
 * Admin Provisioning page
 *
 * Paginated provisioning results with status filter, checkbox multi-select,
 * and "Retry Selected" button that calls POST /api/provisioning/retry.
 *
 * Requirements: 13.4, 5.6–5.9
 */

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PROVISIONING_RESULTS } from "@/lib/mock-data/provisioning";
import type { ProvisioningResult } from "@/lib/types";

const PAGE_SIZE = 25;

type StatusFilter = ProvisioningResult["status"] | "all";

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All Statuses" },
  { value: "success", label: "Success" },
  { value: "failed", label: "Failed" },
  { value: "retrying", label: "Retrying" },
  { value: "pending", label: "Pending" },
];

function statusVariant(
  status: ProvisioningResult["status"],
): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "success":
      return "default";
    case "failed":
      return "destructive";
    case "retrying":
      return "secondary";
    default:
      return "outline";
  }
}

export default function AdminProvisioningPage() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [retrying, setRetrying] = useState(false);
  const [results, setResults] = useState<ProvisioningResult[]>([
    ...PROVISIONING_RESULTS,
  ]);

  useEffect(() => {
    setPage(1);
    setSelected(new Set());
  }, [statusFilter]);

  const filtered = useMemo(
    () =>
      results.filter(
        (r) => statusFilter === "all" || r.status === statusFilter,
      ),
    [results, statusFilter],
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (paged.every((r) => selected.has(r.id))) {
      setSelected((prev) => {
        const next = new Set(prev);
        paged.forEach((r) => next.delete(r.id));
        return next;
      });
    } else {
      setSelected((prev) => {
        const next = new Set(prev);
        paged.forEach((r) => next.add(r.id));
        return next;
      });
    }
  };

  // Gather the MSISDNs and uploadId from selected rows (only failed/retrying are retryable)
  const retryableSelected = results.filter(
    (r) =>
      selected.has(r.id) && (r.status === "failed" || r.status === "retrying"),
  );

  const handleRetry = async () => {
    if (retryableSelected.length === 0) {
      toast.warning("Select failed or retrying rows to retry.");
      return;
    }

    // Group by uploadId
    const byUpload = new Map<string, string[]>();
    for (const r of retryableSelected) {
      const list = byUpload.get(r.uploadId) ?? [];
      list.push(r.msisdn);
      byUpload.set(r.uploadId, list);
    }

    setRetrying(true);

    try {
      // For mock purposes, just use the token from localStorage
      const raw = localStorage.getItem("vldp_user");
      const token = raw
        ? (JSON.parse(raw) as { token?: string }).token
        : undefined;

      let totalQueued = 0;
      for (const [uploadId, msisdns] of byUpload) {
        const res = await fetch("/api/provisioning/retry", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ msisdns, uploadId }),
        });

        if (!res.ok) {
          const err = (await res.json()) as { message?: string };
          toast.error(`Retry failed: ${err.message ?? "Unknown error"}`);
        } else {
          const data = (await res.json()) as { queued: number };
          totalQueued += data.queued;
        }
      }

      if (totalQueued > 0) {
        toast.success(
          `Retried ${totalQueued} provisioning ${totalQueued === 1 ? "entry" : "entries"}.`,
        );
        // Refresh results from in-memory store (re-import to pick up mutations)
        const { PROVISIONING_RESULTS: fresh } =
          await import("@/lib/mock-data/provisioning");
        setResults([...fresh]);
      }

      setSelected(new Set());
    } catch (err) {
      toast.error("Network error during retry.");
      console.error(err);
    } finally {
      setRetrying(false);
    }
  };

  const allPageSelected =
    paged.length > 0 && paged.every((r) => selected.has(r.id));

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-zinc-900">
            Provisioning Results
          </h1>
          <p className="text-sm text-zinc-500 mt-0.5">
            {filtered.length} record{filtered.length !== 1 ? "s" : ""}
          </p>
        </div>

        <div className="flex gap-2 flex-wrap">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
            className="rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-400"
          >
            {STATUS_OPTIONS.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>

          <Button
            variant="outline"
            size="sm"
            onClick={handleRetry}
            disabled={retrying || retryableSelected.length === 0}
          >
            {retrying
              ? "Retrying…"
              : `Retry Selected (${retryableSelected.length})`}
          </Button>
        </div>
      </div>

      <div className="rounded-lg border border-zinc-200 overflow-auto bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">
                <input
                  type="checkbox"
                  checked={allPageSelected}
                  onChange={toggleSelectAll}
                  aria-label="Select all on page"
                  className="rounded"
                />
              </TableHead>
              <TableHead>MSISDN</TableHead>
              <TableHead>Upload ID</TableHead>
              <TableHead>Bundle</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Retries</TableHead>
              <TableHead>Error</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paged.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center text-zinc-400 py-10"
                >
                  No provisioning results found
                </TableCell>
              </TableRow>
            ) : (
              paged.map((r) => (
                <TableRow
                  key={r.id}
                  className={selected.has(r.id) ? "bg-blue-50" : undefined}
                >
                  <TableCell>
                    <input
                      type="checkbox"
                      checked={selected.has(r.id)}
                      onChange={() => toggleSelect(r.id)}
                      aria-label={`Select ${r.msisdn}`}
                      className="rounded"
                    />
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {r.msisdn}
                  </TableCell>
                  <TableCell className="text-xs text-zinc-500">
                    {r.uploadId}
                  </TableCell>
                  <TableCell className="text-xs">{r.bundleId}</TableCell>
                  <TableCell>
                    <Badge variant={statusVariant(r.status)}>{r.status}</Badge>
                  </TableCell>
                  <TableCell className="text-sm text-zinc-600">
                    {r.retryCount}
                  </TableCell>
                  <TableCell className="text-xs text-zinc-500 max-w-xs truncate">
                    {r.errorCode
                      ? `${r.errorCode}: ${r.errorMessage ?? ""}`
                      : "—"}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-zinc-500">
          <span>
            Page {page} of {totalPages}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
