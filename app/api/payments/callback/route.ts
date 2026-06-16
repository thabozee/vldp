/**
 * POST /api/payments/callback
 *
 * Public M-Pesa callback webhook — no auth required.
 * Receives M-Pesa result payload and delegates to handleCallback().
 *
 * Requirements: 4.3, 4.4
 */

import { NextResponse } from 'next/server'
import { handleCallback } from '@/lib/mpesa'
import type { MpesaCallbackPayload } from '@/lib/types'

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

  const payload = body as Record<string, unknown>

  if (typeof payload.checkoutRequestId !== 'string') {
    return NextResponse.json(
      { error: 'Bad Request', message: 'Missing field: checkoutRequestId' },
      { status: 400 },
    )
  }

  if (typeof payload.resultCode !== 'number') {
    return NextResponse.json(
      { error: 'Bad Request', message: 'Missing field: resultCode' },
      { status: 400 },
    )
  }

  const callbackPayload: MpesaCallbackPayload = {
    checkoutRequestId: payload.checkoutRequestId as string,
    resultCode:        payload.resultCode as number,
    resultDesc:        typeof payload.resultDesc === 'string' ? payload.resultDesc : '',
    amount:            typeof payload.amount === 'number' ? payload.amount : undefined,
    mpesaReceiptNumber: typeof payload.mpesaReceiptNumber === 'string' ? payload.mpesaReceiptNumber : undefined,
    transactionDate:   typeof payload.transactionDate === 'string' ? payload.transactionDate : undefined,
  }

  try {
    await handleCallback(callbackPayload)
    return NextResponse.json({ message: 'Callback processed' }, { status: 200 })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Callback processing failed'
    return NextResponse.json(
      { error: 'Internal Server Error', message },
      { status: 500 },
    )
  }
}
