"use client";

/**
 * Admin Students page
 *
 * Searchable, filterable, paginated student table.
 * 25 rows per page. Shows name, MSISDN, institution, status badge, consent badge, opt-in badge.
 *
 * Requirements: 13.3
 */

import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
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
import { STUDENTS } from "@/lib/mock-data/students";
import type { Student } from "@/lib/types";

const PAGE_SIZE = 25;

type StatusFilter = Student["status"] | "all";

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All Statuses" },
  { value: "active", label: "Active" },
  { value: "suspended", label: "Suspended" },
  { value: "pending_registration", label: "Pending" },
];

function statusVariant(
  status: Student["status"],
): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "active":
      return "default";
    case "suspended":
      return "destructive";
    case "pending_registration":
      return "secondary";
    default:
      return "outline";
  }
}

export default function AdminStudentsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [optInFilter, setOptInFilter] = useState<"all" | "true" | "false">(
    "all",
  );
  const [page, setPage] = useState(1);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [search, statusFilter, optInFilter]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return STUDENTS.filter((s) => {
      if (q && !s.name.toLowerCase().includes(q) && !s.msisdn.includes(q))
        return false;
      if (statusFilter !== "all" && s.status !== statusFilter) return false;
      if (optInFilter === "true" && !s.optIn) return false;
      if (optInFilter === "false" && s.optIn) return false;
      return true;
    });
  }, [search, statusFilter, optInFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-zinc-900">Students</h1>
        <p className="text-sm text-zinc-500 mt-0.5">
          {filtered.length} student{filtered.length !== 1 ? "s" : ""} found
        </p>
      </div>

      {/* ── Filters ───────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <Input
            placeholder="Search by name or MSISDN…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

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

        <select
          value={optInFilter}
          onChange={(e) =>
            setOptInFilter(e.target.value as "all" | "true" | "false")
          }
          className="rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-400"
        >
          <option value="all">All Opt-in</option>
          <option value="true">Opted In</option>
          <option value="false">Not Opted In</option>
        </select>
      </div>

      {/* ── Table ─────────────────────────────────────────────────────── */}
      <div className="rounded-lg border border-zinc-200 overflow-auto bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>MSISDN</TableHead>
              <TableHead>Institution</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Consent</TableHead>
              <TableHead>Opt-In</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paged.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center text-zinc-400 py-10"
                >
                  No students found
                </TableCell>
              </TableRow>
            ) : (
              paged.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium">{s.name}</TableCell>
                  <TableCell className="font-mono text-xs">
                    {s.msisdn}
                  </TableCell>
                  <TableCell className="text-xs text-zinc-600">
                    {s.institutionId}
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusVariant(s.status)}>
                      {s.status.replace("_", " ")}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={s.consentGiven ? "default" : "outline"}>
                      {s.consentGiven ? "Given" : "Not given"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={s.optIn ? "default" : "secondary"}>
                      {s.optIn ? "Opted in" : "Opted out"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* ── Pagination ────────────────────────────────────────────────── */}
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
