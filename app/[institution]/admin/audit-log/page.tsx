"use client";

/**
 * Admin Audit Log page
 *
 * Paginated table with filters: action type, actor, date range.
 * Shows: timestamp, action, actor, target, institution.
 *
 * Requirements: 13.7, 14.1–14.5
 */

import { useEffect, useMemo, useState } from "react";
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
import { Input } from "@/components/ui/input";
import { AUDIT_LOG } from "@/lib/mock-data/audit-log";
import type { AuditAction, AuditEntry } from "@/lib/types";
import { format } from "date-fns";

const PAGE_SIZE = 25;

const ACTION_OPTIONS: Array<{ value: AuditAction | "all"; label: string }> = [
  { value: "all", label: "All Actions" },
  { value: "LOGIN", label: "LOGIN" },
  { value: "LOGOUT", label: "LOGOUT" },
  { value: "UPLOAD_CREATED", label: "UPLOAD_CREATED" },
  { value: "UPLOAD_CONFIRMED", label: "UPLOAD_CONFIRMED" },
  { value: "UPLOAD_CANCELLED", label: "UPLOAD_CANCELLED" },
  { value: "PAYMENT_INITIATED", label: "PAYMENT_INITIATED" },
  { value: "PAYMENT_SUCCESS", label: "PAYMENT_SUCCESS" },
  { value: "PAYMENT_FAILED", label: "PAYMENT_FAILED" },
  { value: "PROVISIONING_STARTED", label: "PROVISIONING_STARTED" },
  { value: "PROVISIONING_COMPLETE", label: "PROVISIONING_COMPLETE" },
  { value: "PROVISIONING_RETRY", label: "PROVISIONING_RETRY" },
  { value: "STUDENT_REGISTERED", label: "STUDENT_REGISTERED" },
  { value: "CONSENT_UPDATED", label: "CONSENT_UPDATED" },
  { value: "OPT_IN_UPDATED", label: "OPT_IN_UPDATED" },
  { value: "ADMIN_USER_CREATED", label: "ADMIN_USER_CREATED" },
  { value: "ADMIN_USER_DEACTIVATED", label: "ADMIN_USER_DEACTIVATED" },
  { value: "SETTINGS_UPDATED", label: "SETTINGS_UPDATED" },
  { value: "REPORT_EXPORTED", label: "REPORT_EXPORTED" },
];

function actionVariant(
  action: AuditAction,
): "default" | "secondary" | "destructive" | "outline" {
  if (
    action.startsWith("PAYMENT_FAIL") ||
    action.startsWith("PROVISIONING_RETRY")
  )
    return "destructive";
  if (action.startsWith("LOGIN") || action.startsWith("LOGOUT"))
    return "outline";
  if (action.startsWith("PROVISIONING")) return "default";
  return "secondary";
}

export default function AdminAuditLogPage() {
  const [actionFilter, setActionFilter] = useState<AuditAction | "all">("all");
  const [actorFilter, setActorFilter] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [page, setPage] = useState(1);

  const entries: AuditEntry[] = useMemo(
    () => [...AUDIT_LOG].sort((a, b) => b.timestamp.localeCompare(a.timestamp)),
    [],
  );

  useEffect(() => {
    setPage(1);
  }, [actionFilter, actorFilter, fromDate, toDate]);

  const filtered = useMemo(() => {
    return entries.filter((e) => {
      if (actionFilter !== "all" && e.action !== actionFilter) return false;
      if (
        actorFilter &&
        !e.actorId.toLowerCase().includes(actorFilter.toLowerCase())
      )
        return false;
      if (fromDate && e.timestamp < fromDate) return false;
      if (toDate && e.timestamp > toDate + "T23:59:59") return false;
      return true;
    });
  }, [entries, actionFilter, actorFilter, fromDate, toDate]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-zinc-900">Audit Log</h1>
        <p className="text-sm text-zinc-500 mt-0.5">
          {filtered.length} entr{filtered.length !== 1 ? "ies" : "y"} found
        </p>
      </div>

      {/* ── Filters ───────────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-2">
        <select
          value={actionFilter}
          onChange={(e) =>
            setActionFilter(e.target.value as AuditAction | "all")
          }
          className="rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-400"
        >
          {ACTION_OPTIONS.map(({ value, label }) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>

        <Input
          placeholder="Filter by actor ID…"
          value={actorFilter}
          onChange={(e) => setActorFilter(e.target.value)}
          className="w-48"
        />

        <div className="flex items-center gap-1.5 text-sm text-zinc-500">
          <label htmlFor="from-date">From</label>
          <input
            id="from-date"
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="rounded-md border border-zinc-200 bg-white px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400"
          />
          <label htmlFor="to-date">To</label>
          <input
            id="to-date"
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="rounded-md border border-zinc-200 bg-white px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400"
          />
        </div>
      </div>

      {/* ── Table ─────────────────────────────────────────────────────── */}
      <div className="rounded-lg border border-zinc-200 overflow-auto bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Timestamp</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Actor</TableHead>
              <TableHead>Target</TableHead>
              <TableHead>Institution</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paged.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center text-zinc-400 py-10"
                >
                  No audit entries found
                </TableCell>
              </TableRow>
            ) : (
              paged.map((e) => (
                <TableRow key={e.id}>
                  <TableCell className="text-xs text-zinc-500 whitespace-nowrap">
                    {format(new Date(e.timestamp), "dd MMM yyyy HH:mm:ss")}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={actionVariant(e.action)}
                      className="text-xs"
                    >
                      {e.action}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs font-mono">
                    {e.actorId}
                  </TableCell>
                  <TableCell className="text-xs text-zinc-500">
                    {e.targetType ? `${e.targetType}:` : ""} {e.targetId ?? "—"}
                  </TableCell>
                  <TableCell className="text-xs text-zinc-500">
                    {e.institutionId}
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
