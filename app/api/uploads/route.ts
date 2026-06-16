/**
 * POST /api/uploads
 *
 * Accepts a multipart form upload containing a CSV/XLSX student list, validates
 * it, and creates an Upload record in the in-memory store.
 *
 * Form fields:
 *   file        — the CSV or XLSX file
 *   institutionId — institution the upload belongs to
 *   bundleId    — data bundle to provision
 *
 * Returns 200 { validationResult, uploadId } on success.
 * Returns 401/403 when the caller is not an authenticated SPOC.
 * Returns 422 when the file MIME type is not CSV or XLSX.
 *
 * Requirements: 3.8, 3.9, 3.10, 15.3
 */

import { NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/middleware-helpers'
import { validateStudentList } from '@/lib/validation'
import { createUpload } from '@/lib/upload'
import { logAudit } from '@/lib/audit'

// Permitted MIME types for the uploaded student-list file.
const ALLOWED_MIME_TYPES = new Set([
  'text/csv',
  'application/csv',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
])

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
      { error: 'Forbidden', message: 'Only SPOCs can upload student lists' },
      { status: 403 },
    )
  }

  // ── Parse multipart form data ─────────────────────────────────────────────
  let formData: FormData
  try {
    formData = await req.formData()
  } catch {
    return NextResponse.json(
      { error: 'Bad Request', message: 'Request must be multipart/form-data' },
      { status: 400 },
    )
  }

  const fileEntry = formData.get('file')
  const institutionId = formData.get('institutionId')
  const bundleId = formData.get('bundleId')

  if (!(fileEntry instanceof File)) {
    return NextResponse.json(
      { error: 'Bad Request', message: 'Missing required form field: file' },
      { status: 400 },
    )
  }

  if (typeof institutionId !== 'string' || !institutionId.trim()) {
    return NextResponse.json(
      { error: 'Bad Request', message: 'Missing required form field: institutionId' },
      { status: 400 },
    )
  }

  if (typeof bundleId !== 'string' || !bundleId.trim()) {
    return NextResponse.json(
      { error: 'Bad Request', message: 'Missing required form field: bundleId' },
      { status: 400 },
    )
  }

  // ── Server-side MIME type validation ──────────────────────────────────────
  const mimeType = fileEntry.type.toLowerCase().split(';')[0].trim()
  const fileName = fileEntry.name.toLowerCase()
  const isCsvByName = fileName.endsWith('.csv')
  const isXlsxByName = fileName.endsWith('.xlsx')

  const isMimeAllowed = ALLOWED_MIME_TYPES.has(mimeType) || isCsvByName || isXlsxByName

  if (!isMimeAllowed) {
    return NextResponse.json(
      {
        error: 'Unprocessable Entity',
        message: 'Only CSV (.csv) and Excel (.xlsx) files are accepted',
      },
      { status: 422 },
    )
  }

  // ── Validate student list ─────────────────────────────────────────────────
  let validationResult
  try {
    validationResult = await validateStudentList(fileEntry, institutionId)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Validation failed'

    if (message.startsWith('INVALID_FILE_FORMAT')) {
      return NextResponse.json(
        { error: 'Unprocessable Entity', message },
        { status: 422 },
      )
    }

    if (message.startsWith('FILE_TOO_LARGE')) {
      return NextResponse.json(
        { error: 'Payload Too Large', message },
        { status: 413 },
      )
    }

    return NextResponse.json(
      { error: 'Internal Server Error', message },
      { status: 500 },
    )
  }

  // ── Create Upload record ──────────────────────────────────────────────────
  const upload = createUpload(
    user.id,
    institutionId,
    fileEntry.name,
    validationResult.totalRows,
    validationResult.summary.valid,
    validationResult.summary.invalid,
    bundleId,
  )

  // Stamp the validationResult with the new uploadId
  validationResult.uploadId = upload.id

  // Audit
  logAudit('UPLOAD_CREATED', user.id, {
    actorRole: user.role,
    institutionId,
    targetId: upload.id,
    targetType: 'upload',
    metadata: {
      fileName: fileEntry.name,
      totalRows: validationResult.totalRows,
      validRows: validationResult.summary.valid,
      invalidRows: validationResult.summary.invalid,
      bundleId,
    },
  })

  return NextResponse.json(
    { validationResult, uploadId: upload.id },
    { status: 200 },
  )
}
