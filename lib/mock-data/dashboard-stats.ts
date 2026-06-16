/**
 * VLDP Mock Data — DashboardStats
 *
 * Pre-aggregated statistics for each institution + the 'all' aggregate view,
 * across four time periods: day, week, month, year.
 *
 * Requirements: 11.8, 6.1–6.3, 16.3
 */

import type { DashboardStats } from '../types'

const INST_IDS = [
  'nul',
  'limkokwing',
  'botho',
  'lerotholi',
  'qoaling',
  'abia',
  'little-darlings',
  'tholoana',
] as const

const GENERATED_AT = '2024-12-01T10:00:00.000Z'

type Period = DashboardStats['period']
const PERIODS: Period[] = ['day', 'week', 'month', 'year']

// --- Per-institution base figures (month period) ---
const INST_BASE: Record<
  string,
  {
    name: string
    totalAllocations: number
    successRate: number
    studentsProvisioned: number
    paymentsProcessed: number
    revenueLSL: number
    failedCount: number
    pendingRetry: number
  }
> = {
  nul: {
    name: 'National University of Lesotho',
    totalAllocations: 480,
    successRate: 0.94,
    studentsProvisioned: 450,
    paymentsProcessed: 48,
    revenueLSL: 47520,
    failedCount: 28,
    pendingRetry: 5,
  },
  limkokwing: {
    name: 'Limkokwing University',
    totalAllocations: 310,
    successRate: 0.91,
    studentsProvisioned: 282,
    paymentsProcessed: 31,
    revenueLSL: 20150,
    failedCount: 28,
    pendingRetry: 4,
  },
  botho: {
    name: 'Botho University',
    totalAllocations: 260,
    successRate: 0.92,
    studentsProvisioned: 239,
    paymentsProcessed: 26,
    revenueLSL: 16900,
    failedCount: 21,
    pendingRetry: 3,
  },
  lerotholi: {
    name: 'Lerotholi Polytechnic',
    totalAllocations: 350,
    successRate: 0.89,
    studentsProvisioned: 311,
    paymentsProcessed: 35,
    revenueLSL: 34650,
    failedCount: 38,
    pendingRetry: 6,
  },
  qoaling: {
    name: 'Qoaling High School',
    totalAllocations: 200,
    successRate: 0.95,
    studentsProvisioned: 190,
    paymentsProcessed: 22,
    revenueLSL: 4950,
    failedCount: 10,
    pendingRetry: 2,
  },
  abia: {
    name: 'Abia High School',
    totalAllocations: 180,
    successRate: 0.93,
    studentsProvisioned: 167,
    paymentsProcessed: 20,
    revenueLSL: 8100,
    failedCount: 12,
    pendingRetry: 1,
  },
  'little-darlings': {
    name: 'Little Darlings',
    totalAllocations: 120,
    successRate: 0.97,
    studentsProvisioned: 116,
    paymentsProcessed: 14,
    revenueLSL: 2520,
    failedCount: 4,
    pendingRetry: 0,
  },
  tholoana: {
    name: 'Tholoana ea Bopheho',
    totalAllocations: 140,
    successRate: 0.96,
    studentsProvisioned: 134,
    paymentsProcessed: 16,
    revenueLSL: 4800,
    failedCount: 6,
    pendingRetry: 1,
  },
}

// Scale factor per period relative to month
const PERIOD_SCALE: Record<Period, number> = {
  day:   1 / 30,
  week:  1 / 4,
  month: 1,
  year:  12,
}

function scaleValue(value: number, scale: number): number {
  return Math.round(value * scale)
}

/** Build allocations-over-time array for a period */
function buildAllocationsOverTime(
  instId: string | 'all',
  period: Period,
  totalAllocations: number
): DashboardStats['allocationsOverTime'] {
  const points = period === 'day' ? 24 : period === 'week' ? 7 : period === 'month' ? 30 : 12
  const label = period === 'year' ? 'month' : period === 'month' ? 'day' : period === 'week' ? 'day' : 'hour'
  const perPoint = Math.floor(totalAllocations / points)

  return Array.from({ length: points }, (_, i) => ({
    date: `${label}-${i + 1}`,
    count: perPoint + (i === 0 ? totalAllocations % points : 0), // dump remainder on first point
    institutionId: instId === 'all' ? undefined : instId,
  }))
}

/** Build success/failure by institution breakdown */
function buildSuccessFailureBreakdown(
  instId: string | 'all',
  period: Period
): DashboardStats['successFailureByInstitution'] {
  const scale = PERIOD_SCALE[period]
  if (instId !== 'all') {
    const base = INST_BASE[instId]
    const total = scaleValue(base.totalAllocations, scale)
    const success = Math.round(total * base.successRate)
    return [{ institutionId: instId, institutionName: base.name, success, failed: total - success }]
  }
  return Object.entries(INST_BASE).map(([id, base]) => {
    const total = scaleValue(base.totalAllocations, scale)
    const success = Math.round(total * base.successRate)
    return { institutionId: id, institutionName: base.name, success, failed: total - success }
  })
}

/** Build payment status breakdown */
function buildPaymentStatusBreakdown(
  paymentsProcessed: number
): DashboardStats['paymentStatusBreakdown'] {
  return [
    { status: 'success',   count: paymentsProcessed },
    { status: 'failed',    count: Math.round(paymentsProcessed * 0.07) },
    { status: 'cancelled', count: Math.round(paymentsProcessed * 0.03) },
    { status: 'pending',   count: Math.round(paymentsProcessed * 0.01) },
  ]
}

function makeStat(instId: string | 'all', period: Period): DashboardStats {
  const scale = PERIOD_SCALE[period]

  let summary: DashboardStats['summary']
  let totalAllocations: number

  if (instId === 'all') {
    // Sum across all institutions
    const totals = Object.values(INST_BASE)
    totalAllocations = scaleValue(
      totals.reduce((s, b) => s + b.totalAllocations, 0),
      scale
    )
    const totalStudents = scaleValue(
      totals.reduce((s, b) => s + b.studentsProvisioned, 0),
      scale
    )
    const totalPayments = scaleValue(
      totals.reduce((s, b) => s + b.paymentsProcessed, 0),
      scale
    )
    const totalRevenue = scaleValue(
      totals.reduce((s, b) => s + b.revenueLSL, 0),
      scale
    )
    const totalFailed = scaleValue(
      totals.reduce((s, b) => s + b.failedCount, 0),
      scale
    )
    const totalPending = scaleValue(
      totals.reduce((s, b) => s + b.pendingRetry, 0),
      scale
    )
    const avgSuccessRate =
      totals.reduce((s, b) => s + b.successRate, 0) / totals.length

    summary = {
      totalAllocations,
      successRate: Math.round(avgSuccessRate * 100) / 100,
      totalStudentsProvisioned: totalStudents,
      totalPaymentsProcessed: totalPayments,
      totalRevenueLSL: totalRevenue,
      failedProvisioningCount: totalFailed,
      pendingRetryCount: totalPending,
    }
  } else {
    const base = INST_BASE[instId]
    totalAllocations = scaleValue(base.totalAllocations, scale)
    summary = {
      totalAllocations,
      successRate: base.successRate,
      totalStudentsProvisioned: scaleValue(base.studentsProvisioned, scale),
      totalPaymentsProcessed: scaleValue(base.paymentsProcessed, scale),
      totalRevenueLSL: scaleValue(base.revenueLSL, scale),
      failedProvisioningCount: scaleValue(base.failedCount, scale),
      pendingRetryCount: scaleValue(base.pendingRetry, scale),
    }
  }

  return {
    institutionId: instId,
    period,
    generatedAt: GENERATED_AT,
    summary,
    allocationsOverTime: buildAllocationsOverTime(instId, period, totalAllocations),
    successFailureByInstitution: buildSuccessFailureBreakdown(instId, period),
    paymentStatusBreakdown: buildPaymentStatusBreakdown(summary.totalPaymentsProcessed),
  }
}

// All institutions × all periods + 'all' × all periods
const ALL_INSTITUTION_IDS: Array<string | 'all'> = [...INST_IDS, 'all']

export const DASHBOARD_STATS: DashboardStats[] = ALL_INSTITUTION_IDS.flatMap((instId) =>
  PERIODS.map((period) => makeStat(instId, period))
)

/** Retrieve pre-aggregated stats for a given institution and period */
export function getDashboardStats(
  institutionId: string | 'all',
  period: Period
): DashboardStats | undefined {
  return DASHBOARD_STATS.find(
    (s) => s.institutionId === institutionId && s.period === period
  )
}
