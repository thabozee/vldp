/**
 * VLAP Mock Data — ProvisioningResults
 *
 * Covers success, failed, retrying, and pending statuses per institution.
 * Generated from the 'provisioned' (all success) and 'partial' (mix) uploads.
 *
 * Requirements: 11.5, 5.3–5.9
 */

import type { ProvisioningResult } from '../types'

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

// Sample MSISDNs per institution (10 per institution for provisioned uploads)
const STUDENT_MSISDNS: Record<string, string[]> = {
  nul:               ['+26657210001', '+26657220002', '+26657230003', '+26657240004', '+26657250005',
                      '+26657260006', '+26657270007', '+26657280008', '+26657290009', '+26657291010'],
  limkokwing:        ['+26658210001', '+26658220002', '+26658230003', '+26658240004', '+26658250005',
                      '+26658260006', '+26658270007', '+26658280008', '+26658290009', '+26658291010'],
  botho:             ['+26657310001', '+26657320002', '+26657330003', '+26657340004', '+26657350005',
                      '+26657360006', '+26657370007', '+26657380008', '+26657390009', '+26657391010'],
  lerotholi:         ['+26658310001', '+26658320002', '+26658330003', '+26658340004', '+26658350005',
                      '+26658360006', '+26658370007', '+26658380008', '+26658390009', '+26658391010'],
  qoaling:           ['+26659210001', '+26659220002', '+26659230003', '+26659240004', '+26659250005',
                      '+26659260006', '+26659270007', '+26659280008', '+26659290009', '+26659291010'],
  abia:              ['+26657410001', '+26657420002', '+26657430003', '+26657440004', '+26657450005',
                      '+26657460006', '+26657470007', '+26657480008', '+26657490009', '+26657491010'],
  'little-darlings': ['+26658410001', '+26658420002', '+26658430003', '+26658440004', '+26658450005',
                      '+26658460006', '+26658470007', '+26658480008', '+26658490009', '+26658491010'],
  tholoana:          ['+26659310001', '+26659320002', '+26659330003', '+26659340004', '+26659350005',
                      '+26659360006', '+26659370007', '+26659380008', '+26659390009', '+26659391010'],
}

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

// Student IDs per institution (aligned with students.ts, using inst-specific placeholders for extras)
const STUDENT_IDS: Record<string, string[]> = Object.fromEntries(
  INST_IDS.map((instId) => [
    instId,
    Array.from({ length: 10 }, (_, i) => `student-${instId}-${i + 1}`),
  ])
)

type PRStatus = ProvisioningResult['status']

function makeProvisioningResults(
  instId: string,
  uploadId: string,
  paymentId: string,
  uploadType: 'provisioned' | 'partial'
): ProvisioningResult[] {
  const msisdns = STUDENT_MSISDNS[instId]
  const studentIds = STUDENT_IDS[instId]
  const bundleId = BUNDLE_BY_INST[instId]

  return msisdns.map((msisdn, i) => {
    let status: PRStatus
    let errorCode: string | undefined
    let errorMessage: string | undefined
    let transactionId: string | undefined
    let provisionedAt: string | undefined
    let retryCount = 0

    if (uploadType === 'provisioned') {
      // All succeed in a fully provisioned batch
      status = 'success'
      transactionId = `TXN-${instId.toUpperCase()}-${i + 1}`
      provisionedAt = `2024-04-${10 + i < 10 ? '0' + (10 + i) : 10 + i}T08:35:00.000Z`
    } else {
      // Partial: first 7 succeed, 8th is retrying, 9th/10th failed
      if (i < 7) {
        status = 'success'
        transactionId = `TXN-${instId.toUpperCase()}-P-${i + 1}`
        provisionedAt = `2024-05-${10 + i < 10 ? '0' + (10 + i) : 10 + i}T08:35:00.000Z`
      } else if (i === 7) {
        status = 'retrying'
        errorCode = 'NETWORK_TIMEOUT'
        errorMessage = 'Provisioning request timed out; scheduled for retry.'
        retryCount = 1
      } else {
        status = 'failed'
        errorCode = 'SUBSCRIBER_NOT_FOUND'
        errorMessage = 'MSISDN not found in Vodacom subscriber database.'
        retryCount = 3 // max retries exhausted
      }
    }

    return {
      id: `pr-${instId}-${uploadType === 'provisioned' ? '2' : '3'}-${i + 1}`,
      uploadId,
      paymentId,
      studentId: studentIds[i] || `student-${instId}-${i + 1}`,
      msisdn,
      institutionId: instId,
      bundleId,
      status,
      errorCode,
      errorMessage,
      transactionId,
      provisionedAt,
      retryCount,
      createdAt: `2024-0${uploadType === 'provisioned' ? 4 : 5}-10T08:30:00.000Z`,
    }
  })
}

export const PROVISIONING_RESULTS: ProvisioningResult[] = INST_IDS.flatMap(
  (instId) => [
    // From the 'provisioned' upload (idx 2 → upload-X-2 / payment-X-2)
    ...makeProvisioningResults(
      instId,
      `upload-${instId}-2`,
      `payment-${instId}-2`,
      'provisioned'
    ),
    // From the 'partial' upload (idx 3 → upload-X-3 / payment-X-3)
    ...makeProvisioningResults(
      instId,
      `upload-${instId}-3`,
      `payment-${instId}-3`,
      'partial'
    ),
  ]
)

/** Get provisioning results for an upload */
export function getProvisioningResultsByUploadId(
  uploadId: string
): ProvisioningResult[] {
  return PROVISIONING_RESULTS.filter((r) => r.uploadId === uploadId)
}

/** Get failed / retrying results eligible for retry */
export function getRetryableResults(institutionId: string): ProvisioningResult[] {
  return PROVISIONING_RESULTS.filter(
    (r) =>
      r.institutionId === institutionId &&
      (r.status === 'failed' || r.status === 'retrying') &&
      r.retryCount < 3
  )
}
