/**
 * GET /api/payments/status?checkoutRequestId=X
 *
 * Returns the current status of a Payment record.
 * Requires authentication.
 *
 * Requirements: 4.3
 */

import { NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/middleware-helpers'
import { getPaymentStatus } from '@/lib/mpesa'

export async function GET(req: Request): Promise<NextResponse> {
  // ── Auth ──────────────────────────────────────────────────────────────────
  const user = await getUserFromRequest(req)

  if (!user) {
    return NextResponse.json(
      { error: 'Unauthorized', message: 'Missing or invalid token' },
      { status: 401 },
    )
  }

  // ── Query param ───────────────────────────────────────────────────────────
  const { searchParams } = new URL(req.url)
  const checkoutRequestId = searchParams.get('checkoutRequestId')

  if (!checkoutRequestId) {
    return NextResponse.json(
      { error: 'Bad Request', message: 'Missing query parameter: checkoutRequestId' },
      { status: 400 },
    )
  }

  // ── Look up payment ───────────────────────────────────────────────────────
  const payment = await getPaymentStatus(checkoutRequestId)

  if (!payment) {
    return NextResponse.json(
      { error: 'Not Found', message: `No payment found for checkoutRequestId: ${checkoutRequestId}` },
      { status: 404 },
    )
  }

  return NextResponse.json({ payment }, { status: 200 })
}
