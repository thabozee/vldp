/**
 * POST /api/provisioning/retry
 *
 * Admin-only endpoint to retry failed provisioning entries.
 *
 * Body: { msisdns: string[], uploadId: string }
 * Returns: { queued: number }
 *
 * Requirements: 5.6–5.9, 7.4–7.5
 */

import { NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/middleware-helpers'
import { retryFailed } from '@/lib/provisioning'

export async function POST(req: Request): Promise<NextResponse> {
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
      { error: 'Forbidden', message: 'Only admins can retry failed provisioning' },
      { status: 403 },
    )
  }

  // ── Parse body ────────────────────────────────────────────────────────────
  let body: { msisdns?: unknown; uploadId?: unknown }
  try {
    body = (await req.json()) as { msisdns?: unknown; uploadId?: unknown }
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  if (!Array.isArray(body.msisdns) || body.msisdns.length === 0) {
    return NextResponse.json(
      { error: 'Bad Request', message: 'msisdns must be a non-empty array' },
      { status: 400 },
    )
  }

  if (typeof body.uploadId !== 'string' || !body.uploadId.trim()) {
    return NextResponse.json(
      { error: 'Bad Request', message: 'uploadId is required' },
      { status: 400 },
    )
  }

  const msisdns = body.msisdns as string[]
  const uploadId = body.uploadId as string

  // ── Execute retry ─────────────────────────────────────────────────────────
  try {
    const batchResult = await retryFailed(msisdns, uploadId)

    return NextResponse.json(
      { queued: batchResult.total, result: batchResult },
      { status: 200 },
    )
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Retry failed'
    return NextResponse.json(
      { error: 'Internal Server Error', message },
      { status: 500 },
    )
  }
}
