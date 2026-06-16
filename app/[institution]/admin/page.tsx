"use client";

/**
 * Admin Dashboard page
 *
 * Stat cards, line chart (allocations over time), bar chart (success/failure),
 * period filter, institution filter, skeleton loaders.
 *
 * Requirements: 13.2, 6.1–6.3
 */

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
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

type Period = DashboardStats["period"];

const PERIODS: { value: Period; label: string }[] = [
  { value: "day", label: "Day" },
  { value: "week", label: "Week" },
  { value: "month", label: "Month" },
  { value: "year", label: "Year" },
];

const INSTITUTION_OPTIONS = [
  { value: "all", label: "All Institutions" },
  { value: "nul", label: "NUL" },
  { value: "limkokwing", label: "Limkokwing" },
  { value: "botho", label: "Botho" },
  { value: "lerotholi", label: "Lerotholi" },
  { value: "qoaling", label: "Qoaling" },
  { value: "abia", label: "Abia" },
  { value: "little-darlings", label: "Little Darlings" },
  { value: "tholoana", label: "Tholoana" },
];

// Skeleton card component
function SkeletonCard() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="h-4 w-32 bg-zinc-200 rounded animate-pulse" />
      </CardHeader>
      <CardContent>
        <div className="h-8 w-20 bg-zinc-200 rounded animate-pulse mb-1" />
        <div className="h-3 w-24 bg-zinc-100 rounded animate-pulse" />
      </CardContent>
    </Card>
  );
}

function SkeletonChart() {
  return (
    <Card>
      <CardHeader>
        <div className="h-4 w-40 bg-zinc-200 rounded animate-pulse" />
      </CardHeader>
      <CardContent>
        <div className="h-48 bg-zinc-100 rounded animate-pulse" />
      </CardContent>
    </Card>
  );
}

function StatCard({
  title,
  value,
  subtitle,
}: {
  title: string;
  value: string | number;
  subtitle?: string;
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-zinc-500">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold text-zinc-900">{value}</p>
        {subtitle && <p className="text-xs text-zinc-400 mt-0.5">{subtitle}</p>}
      </CardContent>
    </Card>
  );
}

export default function AdminDashboardPage() {
  const params = useParams<{ institution: string }>();
  const institution = params?.institution ?? "";

  const [period, setPeriod] = useState<Period>("month");
  const [institutionFilter, setInstitutionFilter] = useState<string>("all");
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    // Simulate 500ms loading delay per spec
    const timer = setTimeout(async () => {
      const { getDashboardStats } =
        await import("@/lib/mock-data/dashboard-stats");
      const data = getDashboardStats(institutionFilter, period);
      setStats(data ?? null);
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, [period, institutionFilter]);

  const summary = stats?.summary;

  return (
    <div className="space-y-6">
      {/* ── Header + filters ──────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-zinc-900">Dashboard</h1>
          <p className="text-sm text-zinc-500 mt-0.5">
            Overview of provisioning activity
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {/* Period filter */}
          <div className="flex rounded-lg border border-zinc-200 overflow-hidden">
            {PERIODS.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setPeriod(value)}
                className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                  period === value
                    ? "bg-zinc-900 text-white"
                    : "bg-white text-zinc-600 hover:bg-zinc-50"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Institution filter */}
          <select
            value={institutionFilter}
            onChange={(e) => setInstitutionFilter(e.target.value)}
            className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-400"
          >
            {INSTITUTION_OPTIONS.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ── Stat cards ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
        ) : (
          <>
            <StatCard
              title="Total Allocations"
              value={summary?.totalAllocations.toLocaleString() ?? "—"}
            />
            <StatCard
              title="Success Rate"
              value={
                summary ? `${(summary.successRate * 100).toFixed(1)}%` : "—"
              }
            />
            <StatCard
              title="Students Provisioned"
              value={summary?.totalStudentsProvisioned.toLocaleString() ?? "—"}
            />
            <StatCard
              title="Revenue (LSL)"
              value={
                summary ? `M ${summary.totalRevenueLSL.toLocaleString()}` : "—"
              }
            />
            <StatCard
              title="Failed Count"
              value={summary?.failedProvisioningCount.toLocaleString() ?? "—"}
            />
            <StatCard
              title="Pending Retry"
              value={summary?.pendingRetryCount.toLocaleString() ?? "—"}
            />
          </>
        )}
      </div>

      {/* ── Charts ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Allocations over time — Line chart */}
        {loading ? (
          <SkeletonChart />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">
                Allocations Over Time
              </CardTitle>
            </CardHeader>
            <CardContent>
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
                    stroke="#2563eb"
                    strokeWidth={2}
                    dot={false}
                    name="Allocations"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Success / Failure by institution — Bar chart */}
        {loading ? (
          <SkeletonChart />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">
                Success / Failure by Institution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={stats?.successFailureByInstitution ?? []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="institutionId" tick={{ fontSize: 9 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="success" fill="#16a34a" name="Success" />
                  <Bar dataKey="failed" fill="#dc2626" name="Failed" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
