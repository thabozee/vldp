"use client";

import { useEffect, useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import type { AuditEntry } from "@/lib/types";

const PAGE_SIZE = 25;

export default function AdminAuditLogPage() {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    import("@/lib/mock-data/audit-log").then(({ AUDIT_LOG }) =>
      setEntries(
        [...AUDIT_LOG].sort((a, b) => b.timestamp.localeCompare(a.timestamp)),
      ),
    );
  }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return entries;
    const q = search.toLowerCase();
    return entries.filter(
      (e) =>
        e.action.toLowerCase().includes(q) ||
        e.actorId.toLowerCase().includes(q) ||
        e.institutionId.toLowerCase().includes(q),
    );
  }, [entries, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-zinc-900">Audit Log</h1>
        <p className="text-sm text-zinc-500">{filtered.length} entries</p>
      </div>

      <input
        type="text"
        placeholder="Search by action, actor or institution…"
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setPage(1);
        }}
        className="w-full max-w-sm rounded-lg border border-zinc-200 px-3 py-2 text-sm focus:outline-none focus:ring-2"
        style={{ "--tw-ring-color": "#E60000" } as React.CSSProperties}
      />

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-zinc-50">
                {["Timestamp", "Action", "Actor", "Institution", "Target"].map(
                  (h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-xs font-medium text-zinc-500"
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {paged.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-10 text-center text-zinc-400 text-sm"
                  >
                    No entries found.
                  </td>
                </tr>
              ) : (
                paged.map((e) => (
                  <tr key={e.id} className="border-b hover:bg-zinc-50">
                    <td className="px-4 py-3 text-xs text-zinc-400 whitespace-nowrap">
                      {new Date(e.timestamp).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-block rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-mono font-semibold text-zinc-600">
                        {e.action}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-zinc-600">
                      {e.actorId}
                    </td>
                    <td className="px-4 py-3 text-xs text-zinc-600">
                      {e.institutionId}
                    </td>
                    <td className="px-4 py-3 text-xs text-zinc-400">
                      {e.targetId ?? "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t">
            <p className="text-xs text-zinc-500">
              Page {page} of {totalPages}
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
