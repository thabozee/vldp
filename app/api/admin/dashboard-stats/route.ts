/**
 * GET /api/admin/dashboard-stats
 *
 * Admin-only endpoint returning pre-aggregated DashboardStats.
 *
 * Query params:
 *   institutionId — institution to filter by, or 'all'
 *   period        — 'day' | 'week' | 'month' | 'year' (default: 'month')
 *
 * Requirements: 6.1–6.3, 16.3
 */

import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/middleware-helpers'
import { getDashboardStats } from '@/lib/mock-data/dashboard-stats'
import type { DashboardStats } from '@/lib/types'

type Period = DashboardStats['period']
const VALID_PERIODS: Period[] = ['day', 'week', 'month', 'year']

export async function GET(req: NextRequest): Promise<NextResponse> {
  // ── Auth ──────────────────────────────────────────────────────────────────
  const user = await getUserFromRequest(req)

  if (!user) {
    return NextResponse.json(
      { error: 'Unauthorized', message: 'Missing or invalid token' },
      { status: 401 },
    )
  }

  if (user.role !== 'admin') {
    return NextResponse.json(
      { error: 'Forbidden', message: 'Admin access required' },
      { status: 403 },
    )
  }

  // ── Query params ──────────────────────────────────────────────────────────
  const searchParams = req.nextUrl.searchParams
  const institutionId = searchParams.get('institutionId') ?? 'all'
  const periodParam = searchParams.get('period') ?? 'month'

  if (!VALID_PERIODS.includes(periodParam as Period)) {
    return NextResponse.json(
      {
        error: 'Bad Request',
        message: `period must be one of: ${VALID_PERIODS.join(', ')}`,
      },
      { status: 400 },
    )
  }

  const period = periodParam as Period

  // ── Fetch stats ───────────────────────────────────────────────────────────
  const stats = getDashboardStats(institutionId, period)

  if (!stats) {
    return NextResponse.json(
      { error: 'Not Found', message: `No stats found for institution '${institutionId}' / period '${period}'` },
      { status: 404 },
    )
  }

  return NextResponse.json({ stats }, { status: 200 })
}
