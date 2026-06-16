/**
 * POST /api/payments/initiate
 *
 * Initiates an M-Pesa STK Push for a confirmed upload.
 *
 * Request body (JSON):
 *   { uploadId: string, payerMSISDN: string, amount: number }
 *
 * - Requires SPOC role
 * - Verifies the upload exists and belongs to the caller's institution
 * - Retrieves the institution's merchant MSISDN
 * - Calls initiateSTKPush(...)
 * - Logs a PAYMENT_INITIATED audit entry
 * - Returns { paymentReference: checkoutRequestId, status: 'pending' }
 *
 * Requirements: 4.1–4.5, 5.1, 5.2, 5.10
 */

import { NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/middleware-helpers'
import { getUploadById } from '@/lib/upload'
import { initiateSTKPush } from '@/lib/mpesa'
import { logAudit } from '@/lib/audit'
import { getInstitutionById } from '@/lib/mock-data/institutions'

export async function POST(req: Request): Promise<NextResponse> {
  // ── Auth ──────────────────────────────────────────────────────────────────
  const user = await getUserFromRequest(req)

  if (!user) {
    return NextResponse.json(
      { error: 'Unauthorized', message: 'Missing or invalid token' },
      { status: 401 },
    )
  }

  if (user.role !== 'spoc') {
    return NextResponse.json(
      { error: 'Forbidden', message: 'Only SPOCs can initiate payments' },
      { status: 403 },
    )
  }

  // ── Parse body ────────────────────────────────────────────────────────────
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
      { error: 'Bad Request', message: 'Request body must be a JSON object' },
      { status: 400 },
    )
  }

  const { uploadId, payerMSISDN, amount } = body as Record<string, unknown>

  if (typeof uploadId !== 'string' || !uploadId.trim()) {
    return NextResponse.json(
      { error: 'Bad Request', message: 'Missing required field: uploadId' },
      { status: 400 },
    )
  }

  if (typeof payerMSISDN !== 'string' || !payerMSISDN.trim()) {
    return NextResponse.json(
      { error: 'Bad Request', message: 'Missing required field: payerMSISDN' },
      { status: 400 },
    )
  }

  if (typeof amount !== 'number' || amount <= 0) {
    return NextResponse.json(
      { error: 'Bad Request', message: 'Field "amount" must be a positive number' },
      { status: 400 },
    )
  }

  // ── Resolve upload ────────────────────────────────────────────────────────
  const upload = getUploadById(uploadId)

  if (!upload) {
    return NextResponse.json(
      { error: 'Not Found', message: `Upload not found: ${uploadId}` },
      { status: 404 },
    )
  }

  // ── Institution check ─────────────────────────────────────────────────────
  if (upload.institutionId !== user.institutionId) {
    return NextResponse.json(
      {
        error: 'Unprocessable Entity',
        message: 'Upload does not belong to your institution',
      },
      { status: 422 },
    )
  }

  // ── Get merchant MSISDN from institution ──────────────────────────────────
  const institution = getInstitutionById(user.institutionId)

  if (!institution) {
    return NextResponse.json(
      { error: 'Not Found', message: `Institution not found: ${user.institutionId}` },
      { status: 404 },
    )
  }

  // ── Initiate STK Push ─────────────────────────────────────────────────────
  try {
    const response = await initiateSTKPush({
      payerMSISDN,
      merchantMSISDN: institution.merchantMSISDN,
      amount,
      reference: uploadId,
      description: `Data bundle provisioning for ${institution.shortName}`,
    })

    // Patch the newly created payment record with spocId and institutionId
    // (MpesaService stores these as empty strings on creation so the route
    // can set the correct values from the authenticated user context)
    const { store: _store } = await import('@/lib/mpesa').then(async (m) => {
      // Access the internal store via getPaymentStatus
      const payment = await m.getPaymentStatus(response.checkoutRequestId)
      if (payment) {
        payment.spocId = user.id
        payment.institutionId = user.institutionId
      }
      return { store: null }
    })
    void _store

    // ── Audit: PAYMENT_INITIATED ──────────────────────────────────────────
    logAudit('PAYMENT_INITIATED', user.id, {
      actorRole: user.role,
      institutionId: user.institutionId,
      targetId: uploadId,
      targetType: 'upload',
      metadata: {
        checkoutRequestId: response.checkoutRequestId,
        payerMSISDN,
        merchantMSISDN: institution.merchantMSISDN,
        amount,
      },
    })

    return NextResponse.json(
      {
        paymentReference: response.checkoutRequestId,
        status: 'pending',
      },
      { status: 200 },
    )
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to initiate payment'

    return NextResponse.json(
      { error: 'Internal Server Error', message },
      { status: 500 },
    )
  }
}
