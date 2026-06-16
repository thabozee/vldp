/**
 * POST /api/uploads/confirm
 *
 * Confirms a validated upload and calculates the total payment amount.
 *
 * Request body (JSON):
 *   { uploadId: string, bundleId: string }
 *
 * The payment amount is derived from: upload.validRows × bundle.price
 *
 * Returns 200 { uploadId, paymentAmount } on success.
 * Returns 401/403 for auth failures.
 * Returns 400 for missing/invalid body fields.
 * Returns 404 when the upload or bundle is not found.
 * Returns 422 when the upload does not belong to the caller's institution.
 *
 * Requirements: 3.8, 3.9, 3.10, 15.3
 */

import { NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/middleware-helpers'
import { confirmUpload, getUploadById } from '@/lib/upload'
import { BUNDLES } from '@/lib/mock-data/bundles'

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
      { error: 'Forbidden', message: 'Only SPOCs can confirm uploads' },
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

  const { uploadId, bundleId } = body as Record<string, unknown>

  if (typeof uploadId !== 'string' || !uploadId.trim()) {
    return NextResponse.json(
      { error: 'Bad Request', message: 'Missing required field: uploadId' },
      { status: 400 },
    )
  }

  if (typeof bundleId !== 'string' || !bundleId.trim()) {
    return NextResponse.json(
      { error: 'Bad Request', message: 'Missing required field: bundleId' },
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

  // ── Resolve bundle and calculate payment ──────────────────────────────────
  const bundle = BUNDLES.find((b) => b.id === bundleId)

  if (!bundle) {
    return NextResponse.json(
      { error: 'Not Found', message: `Bundle not found: ${bundleId}` },
      { status: 404 },
    )
  }

  const paymentAmount = upload.validRows * bundle.price

  // ── Confirm upload ────────────────────────────────────────────────────────
  try {
    const result = await confirmUpload(
      uploadId,
      user.id,
      user.role,
      user.institutionId,
      paymentAmount,
    )

    return NextResponse.json(result, { status: 200 })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to confirm upload'

    return NextResponse.json(
      { error: 'Internal Server Error', message },
      { status: 500 },
    )
  }
}
