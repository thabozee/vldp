"use client";

/**
 * Global Admin Dashboard — cross-institution view
 * Shows aggregated stats + per-institution breakdown.
 */

import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DashboardStats } from "@/lib/types";

const V = { red: "#E60000" };
type Period = DashboardStats["period"];
const PERIODS: { value: Period; label: string }[] = [
  { value: "day", label: "Day" },
  { value: "week", label: "Week" },
  { value: "month", label: "Month" },
  { value: "year", label: "Year" },
];

function SkeletonCard() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="h-4 w-28 bg-zinc-200 rounded animate-pulse" />
      </CardHeader>
      <CardContent>
        <div className="h-8 w-20 bg-zinc-200 rounded animate-pulse" />
      </CardContent>
    </Card>
  );
}

function StatCard({
  title,
  value,
  sub,
}: {
  title: string;
  value: string | number;
  sub?: string;
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-xs font-medium text-zinc-500">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold text-zinc-900">{value}</p>
        {sub && <p className="text-xs text-zinc-400 mt-0.5">{sub}</p>}
      </CardContent>
    </Card>
  );
}

export default function AdminDashboardPage() {
  const [period, setPeriod] = useState<Period>("month");
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const t = setTimeout(async () => {
      const { getDashboardStats } =
        await import("@/lib/mock-data/dashboard-stats");
      setStats(getDashboardStats("all", period) ?? null);
      setLoading(false);
    }, 400);
    return () => clearTimeout(t);
  }, [period]);

  const s = stats?.summary;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-zinc-900">Dashboard</h1>
          <p className="text-sm text-zinc-500">
            All institutions — Vodacom Lesotho
          </p>
        </div>
        <div className="flex rounded-lg border border-zinc-200 overflow-hidden">
          {PERIODS.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setPeriod(value)}
              className="px-3 py-1.5 text-xs font-medium transition-colors"
              style={{
                backgroundColor: period === value ? V.red : "#fff",
                color: period === value ? "#fff" : "#555",
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
        ) : (
          <>
            <StatCard
              title="Total Allocations"
              value={s?.totalAllocations.toLocaleString() ?? "—"}
            />
            <StatCard
              title="Success Rate"
              value={s ? `${(s.successRate * 100).toFixed(1)}%` : "—"}
            />
            <StatCard
              title="Students Provisioned"
              value={s?.totalStudentsProvisioned.toLocaleString() ?? "—"}
            />
            <StatCard
              title="Revenue (LSL)"
              value={s ? `M ${s.totalRevenueLSL.toLocaleString()}` : "—"}
            />
            <StatCard
              title="Failed"
              value={s?.failedProvisioningCount.toLocaleString() ?? "—"}
            />
            <StatCard
              title="Pending Retry"
              value={s?.pendingRetryCount.toLocaleString() ?? "—"}
            />
          </>
        )}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Allocations Over Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-48 bg-zinc-100 rounded animate-pulse" />
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={stats?.allocationsOverTime ?? []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 10 }}
                    interval="preserveStartEnd"
                  />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke={V.red}
                    strokeWidth={2}
                    dot={false}
                    name="Allocations"
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Success / Failure by Institution
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-48 bg-zinc-100 rounded animate-pulse" />
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={stats?.successFailureByInstitution ?? []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="institutionId" tick={{ fontSize: 9 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="success" fill={V.red} name="Success" />
                  <Bar dataKey="failed" fill="#B30000" name="Failed" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
