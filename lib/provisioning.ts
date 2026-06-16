/**
 * ProvisioningService — provision data bundles to students via Vodacom Core API (mock).
 *
 * Requirements: 5.1–5.9, 7.1–7.5, 8.6, 15.5
 */

import type {
  Allocation,
  BatchProvisioningResult,
  ProvisioningResult,
  StudentRow,
} from './types'
import { PROVISIONING_RESULTS } from './mock-data/provisioning'
import { ALLOCATIONS } from './mock-data/allocations'
import { STUDENTS } from './mock-data/students'
import { BUNDLES } from './mock-data/bundles'
import { getUploadById } from './upload'
import { logAudit } from './audit'

// ---------------------------------------------------------------------------
// In-memory stores seeded from mock data
// ---------------------------------------------------------------------------

const provisioningStore: ProvisioningResult[] = [...PROVISIONING_RESULTS]
const allocationStore: Allocation[] = [...ALLOCATIONS]

// ---------------------------------------------------------------------------
// ProvisioningRequest — internal type for a single provisioning call
// ---------------------------------------------------------------------------

export interface ProvisioningRequest {
  uploadId: string
  paymentId: string
  studentId: string
  msisdn: string
  institutionId: string
  bundleId: string
}

// ---------------------------------------------------------------------------
// Vodacom Core API mock helper
// ---------------------------------------------------------------------------

/** Simulate the Vodacom Core API: 90% success, 100–300ms random delay */
async function callVodacomCoreApi(
  msisdn: string,
  bundleId: string,
): Promise<{ success: boolean; transactionId?: string; errorCode?: string; errorMessage?: string }> {
  const delay = 100 + Math.floor(Math.random() * 200)
  await new Promise((resolve) => setTimeout(resolve, delay))

  const success = Math.random() < 0.9

  if (success) {
    return {
      success: true,
      transactionId: `TXN-${bundleId.toUpperCase()}-${msisdn.replace(/\D/g, '').slice(-6)}-${Date.now()}`,
    }
  }

  return {
    success: false,
    errorCode: 'VODACOM_CORE_ERROR',
    errorMessage: 'Provisioning request rejected by Vodacom Core API.',
  }
}

// ---------------------------------------------------------------------------
// provisionSingle
// ---------------------------------------------------------------------------

/**
 * Provision a single student, checking consent before calling the Vodacom Core API.
 * Creates a ProvisioningResult and (on success) an Allocation.
 *
 * Requirements: 5.1–5.5, 8.6
 */
export async function provisionSingle(req: ProvisioningRequest): Promise<ProvisioningResult> {
  const {
    uploadId,
    paymentId,
    studentId,
    msisdn,
    institutionId,
    bundleId,
  } = req

  // Req 8.6 — consent check
  const student = STUDENTS.find((s) => s.id === studentId || s.msisdn === msisdn)
  if (!student || !student.consentGiven) {
    const result: ProvisioningResult = {
      id: crypto.randomUUID(),
      uploadId,
      paymentId,
      studentId,
      msisdn,
      institutionId,
      bundleId,
      status: 'failed',
      errorCode: 'CONSENT_NOT_GIVEN',
      errorMessage: 'Student has not given consent for allocation.',
      retryCount: 0,
      createdAt: new Date().toISOString(),
    }
    provisioningStore.push(result)
    return result
  }

  // Call mock Vodacom Core API
  const apiResponse = await callVodacomCoreApi(msisdn, bundleId)

  const now = new Date().toISOString()

  if (apiResponse.success && apiResponse.transactionId) {
    // Success path — create ProvisioningResult and Allocation
    const result: ProvisioningResult = {
      id: crypto.randomUUID(),
      uploadId,
      paymentId,
      studentId,
      msisdn,
      institutionId,
      bundleId,
      status: 'success',
      transactionId: apiResponse.transactionId,
      provisionedAt: now,
      retryCount: 0,
      createdAt: now,
    }
    provisioningStore.push(result)

    // Req 5.4 — create Allocation with source spoc_upload
    const bundle = BUNDLES.find((b) => b.id === bundleId)
    const validUntil = new Date(Date.now() + (bundle?.validityDays ?? 30) * 86400 * 1000).toISOString()

    const allocation: Allocation = {
      id: crypto.randomUUID(),
      studentId,
      msisdn,
      institutionId,
      bundleId,
      bundleName: bundle?.name ?? bundleId,
      bundleSize: bundle?.size ?? 'Unknown',
      validFrom: now,
      validUntil,
      source: 'spoc_upload',
      provisioningResultId: result.id,
      paymentId,
      createdAt: now,
    }
    allocationStore.push(allocation)

    return result
  }

  // Failure path
  const result: ProvisioningResult = {
    id: crypto.randomUUID(),
    uploadId,
    paymentId,
    studentId,
    msisdn,
    institutionId,
    bundleId,
    status: 'failed',
    errorCode: apiResponse.errorCode ?? 'UNKNOWN_ERROR',
    errorMessage: apiResponse.errorMessage ?? 'An unknown error occurred.',
    retryCount: 0,
    createdAt: now,
  }
  provisioningStore.push(result)
  return result
}

// ---------------------------------------------------------------------------
// provisionBatch
// ---------------------------------------------------------------------------

/**
 * Provision all valid rows in an upload batch.
 * Logs PROVISIONING_STARTED before and PROVISIONING_COMPLETE after.
 * Updates Upload status to 'provisioned' (all success) or 'partial' (any failed).
 * Enforces: succeeded + failed === validRows.length
 *
 * Requirements: 5.1–5.9, 7.1–7.5, 15.5
 */
export async function provisionBatch(
  uploadId: string,
  rows: StudentRow[],
  bundleId: string,
): Promise<BatchProvisioningResult> {
  const upload = getUploadById(uploadId)
  const institutionId = upload?.institutionId ?? rows[0]?.institutionId ?? 'unknown'
  const paymentId = upload?.paymentId ?? `payment-${uploadId}`

  // Req 15.5 — PROVISIONING_STARTED audit
  logAudit('PROVISIONING_STARTED', 'system', {
    actorRole: 'admin',
    institutionId,
    targetId: uploadId,
    targetType: 'upload',
    metadata: { totalRows: rows.length, bundleId },
  })

  // Process each row
  const results = await Promise.all(
    rows.map((row) => {
      // Try to find student by MSISDN, fall back to generated ID
      const student = STUDENTS.find((s) => s.msisdn === row.msisdn)
      const studentId = student?.id ?? `student-${row.institutionId}-${row.msisdn.slice(-4)}`

      return provisionSingle({
        uploadId,
        paymentId,
        studentId,
        msisdn: row.msisdn,
        institutionId: row.institutionId,
        bundleId,
      })
    }),
  )

  const succeeded = results.filter((r) => r.status === 'success').length
  const failed = results.length - succeeded

  // Enforce invariant: succeeded + failed === validRows.length
  if (succeeded + failed !== rows.length) {
    throw new Error(
      `Batch invariant violation: ${succeeded} + ${failed} !== ${rows.length}`,
    )
  }

  // Update upload status
  if (upload) {
    (upload as { status: string }).status = failed === 0 ? 'provisioned' : 'partial'
  }

  // Req 15.5 — PROVISIONING_COMPLETE audit
  logAudit('PROVISIONING_COMPLETE', 'system', {
    actorRole: 'admin',
    institutionId,
    targetId: uploadId,
    targetType: 'upload',
    metadata: { succeeded, failed, total: rows.length },
  })

  return {
    uploadId,
    total: rows.length,
    succeeded,
    failed,
    results,
  }
}

// ---------------------------------------------------------------------------
// retryFailed
// ---------------------------------------------------------------------------

/**
 * Retry only the MSISDNs with current status 'failed'.
 * Rejects if retryCount >= 3. Increments retryCount on each attempt.
 * Does NOT create duplicate Allocations (deduplicates by msisdn).
 * Creates PROVISIONING_RETRY audit entry.
 *
 * Requirements: 5.6–5.9, 7.4–7.5
 */
export async function retryFailed(
  msisdns: string[],
  uploadId: string,
): Promise<BatchProvisioningResult> {
  const upload = getUploadById(uploadId)
  const institutionId = upload?.institutionId ?? 'unknown'
  const paymentId = upload?.paymentId ?? `payment-${uploadId}`

  // Req 15.5 — PROVISIONING_RETRY audit
  logAudit('PROVISIONING_RETRY', 'system', {
    actorRole: 'admin',
    institutionId,
    targetId: uploadId,
    targetType: 'upload',
    metadata: { msisdns, count: msisdns.length },
  })

  // Deduplicate input
  const uniqueMsisdns = [...new Set(msisdns)]

  const results: ProvisioningResult[] = []

  for (const msisdn of uniqueMsisdns) {
    // Find existing failed result for this MSISDN in this upload
    const existing = provisioningStore
      .filter((r) => r.msisdn === msisdn && r.uploadId === uploadId && r.status === 'failed')
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0]

    if (!existing) {
      // Skip MSISDNs that don't have a failed entry
      continue
    }

    // Req 5.7 — reject if retryCount >= 3
    if (existing.retryCount >= 3) {
      results.push(existing)
      continue
    }

    // Increment retryCount on the existing record
    existing.retryCount += 1
    existing.status = 'retrying'

    // Check if already has a successful allocation (don't duplicate)
    const hasAllocation = allocationStore.some(
      (a) => a.msisdn === msisdn && a.provisioningResultId,
    )

    // Attempt provisioning
    const student = STUDENTS.find((s) => s.msisdn === msisdn)
    const studentId = existing.studentId

    // Check consent
    if (!student || !student.consentGiven) {
      existing.status = 'failed'
      existing.errorCode = 'CONSENT_NOT_GIVEN'
      existing.errorMessage = 'Student has not given consent for allocation.'
      results.push(existing)
      continue
    }

    const apiResponse = await callVodacomCoreApi(msisdn, existing.bundleId)
    const now = new Date().toISOString()

    if (apiResponse.success && apiResponse.transactionId) {
      existing.status = 'success'
      existing.transactionId = apiResponse.transactionId
      existing.provisionedAt = now
      existing.errorCode = undefined
      existing.errorMessage = undefined

      // Only create allocation if one doesn't already exist
      if (!hasAllocation) {
        const bundle = BUNDLES.find((b) => b.id === existing.bundleId)
        const validUntil = new Date(
          Date.now() + (bundle?.validityDays ?? 30) * 86400 * 1000,
        ).toISOString()

        const allocation: Allocation = {
          id: crypto.randomUUID(),
          studentId,
          msisdn,
          institutionId,
          bundleId: existing.bundleId,
          bundleName: bundle?.name ?? existing.bundleId,
          bundleSize: bundle?.size ?? 'Unknown',
          validFrom: now,
          validUntil,
          source: 'spoc_upload',
          provisioningResultId: existing.id,
          paymentId,
          createdAt: now,
        }
        allocationStore.push(allocation)
      }
    } else {
      existing.status = 'failed'
      existing.errorCode = apiResponse.errorCode ?? 'UNKNOWN_ERROR'
      existing.errorMessage = apiResponse.errorMessage ?? 'An unknown error occurred.'
    }

    results.push(existing)
  }

  const succeeded = results.filter((r) => r.status === 'success').length
  const failed = results.filter((r) => r.status === 'failed').length

  // Update upload status after retry
  if (upload && results.length > 0) {
    const allUploadResults = provisioningStore.filter((r) => r.uploadId === uploadId)
    const anyFailed = allUploadResults.some((r) => r.status === 'failed' || r.status === 'retrying')
    ;(upload as { status: string }).status = anyFailed ? 'partial' : 'provisioned'
  }

  return {
    uploadId,
    total: results.length,
    succeeded,
    failed,
    results,
  }
}

// ---------------------------------------------------------------------------
// getProvisioningStatus
// ---------------------------------------------------------------------------

/**
 * Returns current provisioning results for an upload.
 *
 * Requirements: 5.5
 */
export async function getProvisioningStatus(
  uploadId: string,
): Promise<BatchProvisioningResult> {
  const results = provisioningStore.filter((r) => r.uploadId === uploadId)
  const succeeded = results.filter((r) => r.status === 'success').length
  const failed = results.filter((r) => r.status === 'failed' || r.status === 'retrying').length

  return {
    uploadId,
    total: results.length,
    succeeded,
    failed,
    results,
  }
}
