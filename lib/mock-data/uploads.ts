/**
 * VLAP Mock Data — Uploads
 *
 * Five Upload records per institution (40 total), covering all statuses.
 * Some rows intentionally contain invalid MSISDNs, duplicate MSISDNs, and
 * missing fields to demonstrate validation error handling.
 *
 * Status distribution per institution:
 *   [0] pending_payment
 *   [1] provisioned
 *   [2] partial
 *   [3] payment_failed
 *   [4] cancelled
 *
 * Requirements: 11.3, 3.9
 */

import type { Upload } from '../types'

// Institution IDs in order
const INST_IDS = [
  'nul',
  'limkokwing',
  'botho',
  'lerotholi',
  'qoaling',
  'abia',
  'little-darlings',
  'tholoana',
] as const

// SPOC user IDs per institution
const SPOC_IDS: Record<string, string> = {
  nul: 'user-nul-spoc',
  limkokwing: 'user-limkokwing-spoc',
  botho: 'user-botho-spoc',
  lerotholi: 'user-lerotholi-spoc',
  qoaling: 'user-qoaling-spoc',
  abia: 'user-abia-spoc',
  'little-darlings': 'user-little-darlings-spoc',
  tholoana: 'user-tholoana-spoc',
}

// Bundle IDs per institution tier
const BUNDLE_BY_INST: Record<string, string> = {
  nul: 'bundle-ter-5gb',
  limkokwing: 'bundle-ter-3gb',
  botho: 'bundle-ter-3gb',
  lerotholi: 'bundle-ter-5gb',
  qoaling: 'bundle-sec-1gb',
  abia: 'bundle-sec-2gb',
  'little-darlings': 'bundle-pri-500mb',
  tholoana: 'bundle-pri-1gb',
}

type UploadStatus = Upload['status']

const STATUSES: UploadStatus[] = [
  'pending_payment',
  'provisioned',
  'partial',
  'payment_failed',
  'cancelled',
]

function makeUpload(
  instId: string,
  statusIndex: number,
  seq: number
): Upload {
  const status = STATUSES[statusIndex]
  const isProcessed = status === 'provisioned' || status === 'partial'
  const uploadedAt = `2024-0${3 + statusIndex}-${10 + seq}T08:00:00.000Z`

  // For uploads that include validation errors — slot [3] (payment_failed) and [4] (cancelled)
  // deliberately have invalid + duplicate rows to demonstrate error scenarios
  const hasInvalidRows = statusIndex >= 3

  const totalRows = hasInvalidRows ? 12 : 10
  const invalidRows = hasInvalidRows ? 3 : 0 // 2 invalid MSISDNs + 1 missing field
  const validRows = totalRows - invalidRows

  return {
    id: `upload-${instId}-${statusIndex + 1}`,
    institutionId: instId,
    spocId: SPOC_IDS[instId],
    fileName: `students-batch-${seq + 1}.csv`,
    totalRows,
    validRows,
    invalidRows,
    status,
    // paymentId is set for statuses that progressed past pending
    paymentId:
      status === 'pending_payment' ? undefined : `payment-${instId}-${statusIndex + 1}`,
    bundleId: BUNDLE_BY_INST[instId],
    uploadedAt,
    processedAt: isProcessed ? `2024-0${3 + statusIndex}-${10 + seq}T08:30:00.000Z` : undefined,
  }
}

export const UPLOADS: Upload[] = INST_IDS.flatMap((instId) =>
  STATUSES.map((_, statusIndex) => makeUpload(instId, statusIndex, statusIndex))
)

/**
 * Sample invalid row data associated with uploads — used in UI validation modals.
 * These are for display purposes only (not typed as Upload rows).
 */
export const SAMPLE_INVALID_ROWS = [
  // Invalid MSISDN format
  { rowIndex: 3, msisdn: '083123456', name: 'John Smith', reason: 'INVALID_MSISDN' },
  // Duplicate MSISDN (appears again in same upload)
  { rowIndex: 7, msisdn: '+26657210001', name: 'Thabo Molefe', reason: 'DUPLICATE_MSISDN' },
  // Missing required field (name is blank)
  { rowIndex: 9, msisdn: '+26657899999', name: '', reason: 'MISSING_FIELD' },
]

/** Get uploads for an institution */
export function getUploadsByInstitution(institutionId: string): Upload[] {
  return UPLOADS.filter((u) => u.institutionId === institutionId)
}

/** Get upload by id */
export function getUploadById(id: string): Upload | undefined {
  return UPLOADS.find((u) => u.id === id)
}
