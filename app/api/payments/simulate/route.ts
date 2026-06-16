/**
 * POST /api/payments/simulate
 *
 * Dev-only endpoint to simulate an M-Pesa payment result.
 * Body: { uploadId: string, success: boolean }
 *
 * Requirements: 4.1 (demo/mock support)
 */

import { NextResponse } from 'next/server'
import { simulatePaymentResult } from '@/lib/mpesa'

export async function POST(req: Request): Promise<NextResponse> {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json(
      { error: 'Bad Request', message: 'Request body must be valid JSON' },
      { status: 400 },
    )
  }

  if (!body || typeof body !== 'object') {
    return NextResponse.json(
      { error: 'Bad Request', message: 'Invalid payload' },
      { status: 400 },
    )
  }

  const { uploadId, success } = body as Record<string, unknown>

  if (typeof uploadId !== 'string' || !uploadId.trim()) {
    return NextResponse.json(
      { error: 'Bad Request', message: 'Missing field: uploadId' },
      { status: 400 },
    )
  }

  if (typeof success !== 'boolean') {
    return NextResponse.json(
      { error: 'Bad Request', message: 'Field success must be boolean' },
      { status: 400 },
    )
  }

  try {
    await simulatePaymentResult(uploadId, success)
    return NextResponse.json(
      { message: `Payment simulation completed: ${success ? 'success' : 'failure'}` },
      { status: 200 },
    )
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Simulation failed'
    return NextResponse.json(
      { error: 'Internal Server Error', message },
      { status: 500 },
    )
  }
}
