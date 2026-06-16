/**
 * GET /api/uploads/[id]
 *
 * Returns a single upload record by its ID.
 * Requires an authenticated user (any role).
 *
 * Returns 200 { upload } on success.
 * Returns 401 when the caller is not authenticated.
 * Returns 404 when no upload with the given ID exists.
 *
 * Requirements: 3.9, 15.3
 */

import { NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/middleware-helpers'
import { getUploadById } from '@/lib/upload'

interface RouteContext {
  params: Promise<{ id: string }>
}

export async function GET(req: Request, context: RouteContext): Promise<NextResponse> {
  // ── Auth ──────────────────────────────────────────────────────────────────
  const user = await getUserFromRequest(req)

  if (!user) {
    return NextResponse.json(
      { error: 'Unauthorized', message: 'Missing or invalid token' },
      { status: 401 },
    )
  }

  // ── Resolve upload ────────────────────────────────────────────────────────
  const { id } = await context.params
  const upload = getUploadById(id)

  if (!upload) {
    return NextResponse.json(
      { error: 'Not Found', message: `Upload not found: ${id}` },
      { status: 404 },
    )
  }

  return NextResponse.json({ upload }, { status: 200 })
}
