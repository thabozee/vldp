/**
 * UploadService — in-memory upload store and upload lifecycle operations.
 *
 * Requirements: 3.1–3.10, 15.2
 */

import type { Upload, UserRole } from './types'
import { UPLOADS } from './mock-data/uploads'
import { logAudit } from './audit'

// ---------------------------------------------------------------------------
// In-memory store — seeded from mock data
// ---------------------------------------------------------------------------

const store: Upload[] = [...UPLOADS]

// ---------------------------------------------------------------------------
// Store helpers
// ---------------------------------------------------------------------------

/**
 * Returns all uploads for a given SPOC user.
 * Requirements: 3.8
 */
export function getUploadsBySpoc(spocId: string): Upload[] {
  return store.filter((u) => u.spocId === spocId)
}

/**
 * Returns a single upload by its ID, or `undefined` if not found.
 * Requirements: 3.9
 */
export function getUploadById(id: string): Upload | undefined {
  return store.find((u) => u.id === id)
}

/** Persists a new Upload record to the in-memory store. */
function saveUpload(upload: Upload): void {
  store.push(upload)
}

// ---------------------------------------------------------------------------
// createUpload
// ---------------------------------------------------------------------------

/**
 * Creates a new Upload record with status `pending_payment` and saves it to
 * the in-memory store.
 *
 * Requirements: 3.1, 3.2
 */
export function createUpload(
  spocId: string,
  institutionId: string,
  fileName: string,
  totalRows: number,
  validRows: number,
  invalidRows: number,
  bundleId: string,
): Upload {
  const upload: Upload = {
    id: crypto.randomUUID(),
    institutionId,
    spocId,
    fileName,
    totalRows,
    validRows,
    invalidRows,
    status: 'pending_payment',
    bundleId,
    uploadedAt: new Date().toISOString(),
  }

  saveUpload(upload)
  return upload
}

// ---------------------------------------------------------------------------
// confirmUpload
// ---------------------------------------------------------------------------

/**
 * Confirms an upload after the SPOC has reviewed validation results.
 *
 * Validates:
 *  - Upload exists
 *  - Upload belongs to the SPOC's institution
 *
 * On success:
 *  - Updates upload status to `pending_payment`
 *  - Creates an `UPLOAD_CONFIRMED` audit entry
 *  - Returns `{ uploadId, paymentAmount }`
 *
 * Requirements: 3.8, 3.9, 3.10, 15.2
 */
export async function confirmUpload(
  uploadId: string,
  spocId: string,
  spocRole: UserRole,
  institutionId: string,
  paymentAmount: number,
): Promise<{ uploadId: string; paymentAmount: number }> {
  const upload = store.find((u) => u.id === uploadId)

  if (!upload) {
    throw new Error(`Upload not found: ${uploadId}`)
  }

  if (upload.institutionId !== institutionId) {
    throw new Error(`Upload ${uploadId} does not belong to institution ${institutionId}`)
  }

  // Mutate status in-place
  upload.status = 'pending_payment'

  // Audit
  logAudit('UPLOAD_CONFIRMED', spocId, {
    actorRole: spocRole,
    institutionId,
    targetId: uploadId,
    targetType: 'upload',
    metadata: { paymentAmount },
  })

  return { uploadId, paymentAmount }
}

// ---------------------------------------------------------------------------
// cancelUpload
// ---------------------------------------------------------------------------

/**
 * Cancels an upload, setting its status to `cancelled`.
 *
 * Validates:
 *  - Upload exists
 *  - Upload belongs to the caller's institution
 *
 * Creates an `UPLOAD_CANCELLED` audit entry.
 *
 * Requirements: 3.10, 15.2
 */
export async function cancelUpload(
  uploadId: string,
  spocId: string,
  institutionId: string,
): Promise<void> {
  const upload = store.find((u) => u.id === uploadId)

  if (!upload) {
    throw new Error(`Upload not found: ${uploadId}`)
  }

  if (upload.institutionId !== institutionId) {
    throw new Error(`Upload ${uploadId} does not belong to institution ${institutionId}`)
  }

  upload.status = 'cancelled'

  logAudit('UPLOAD_CANCELLED', spocId, {
    actorRole: 'spoc',
    institutionId,
    targetId: uploadId,
    targetType: 'upload',
  })
}
