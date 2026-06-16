/**
 * VLAP Mock Data — Allocations
 *
 * Includes both `spoc_upload` allocations (linked to ProvisioningResults)
 * and `self_purchase` allocations (students buying bundles independently).
 *
 * Requirements: 11.6, 5.4, 9.3
 */

import type { Allocation } from '../types'

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

const BUNDLE_META: Record<string, { name: string; size: string }> = {
  'bundle-ter-5gb': { name: 'Tertiary Premium 5 GB', size: '5 GB' },
  'bundle-ter-3gb': { name: 'Tertiary Standard 3 GB', size: '3 GB' },
  'bundle-sec-1gb': { name: 'Secondary Standard 1 GB', size: '1 GB' },
  'bundle-sec-2gb': { name: 'Secondary Premium 2 GB', size: '2 GB' },
  'bundle-pri-500mb': { name: 'Primary Standard 500 MB', size: '500 MB' },
  'bundle-pri-1gb': { name: 'Primary Premium 1 GB', size: '1 GB' },
  'bundle-all-weekly-500mb': { name: 'All-Schools Weekly 500 MB', size: '500 MB' },
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

// MSISDNs from provisioning.ts (first 7 successful rows per institution per batch)
const STUDENT_MSISDNS: Record<string, string[]> = {
  nul: ['+26657210001', '+26657220002', '+26657230003', '+26657240004', '+26657250005',
        '+26657260006', '+26657270007'],
  limkokwing: ['+26658210001', '+26658220002', '+26658230003', '+26658240004', '+26658250005',
               '+26658260006', '+26658270007'],
  botho: ['+26657310001', '+26657320002', '+26657330003', '+26657340004', '+26657350005',
          '+26657360006', '+26657370007'],
  lerotholi: ['+26658310001', '+26658320002', '+26658330003', '+26658340004', '+26658350005',
              '+26658360006', '+26658370007'],
  qoaling: ['+26659210001', '+26659220002', '+26659230003', '+26659240004', '+26659250005',
            '+26659260006', '+26659270007'],
  abia: ['+26657410001', '+26657420002', '+26657430003', '+26657440004', '+26657450005',
         '+26657460006', '+26657470007'],
  'little-darlings': ['+26658410001', '+26658420002', '+26658430003', '+26658440004', '+26658450005',
                      '+26658460006', '+26658470007'],
  tholoana: ['+26659310001', '+26659320002', '+26659330003', '+26659340004', '+26659350005',
             '+26659360006', '+26659370007'],
}

const STUDENT_IDS: Record<string, string[]> = Object.fromEntries(
  INST_IDS.map((instId) => [
    instId,
    Array.from({ length: 10 }, (_, i) => `student-${instId}-${i + 1}`),
  ])
)

// validFrom / validUntil helpers
function addDays(isoDate: string, days: number): string {
  const d = new Date(isoDate)
  d.setDate(d.getDate() + days)
  return d.toISOString()
}

/**
 * Generate spoc_upload allocations from the 'provisioned' upload batch
 * (upload idx 2: all 10 rows succeeded)
 */
function makeSpocAllocations(instId: string): Allocation[] {
  const bundleId = BUNDLE_BY_INST[instId]
  const { name, size } = BUNDLE_META[bundleId]
  const msisdns = STUDENT_MSISDNS[instId]
  const studentIds = STUDENT_IDS[instId]

  return msisdns.map((msisdn, i) => {
    const sec = String(i).padStart(2, '0')
    const createdAt = `2024-04-10T08:36:${sec}.000Z`
    return {
      id: `alloc-spoc-${instId}-${i + 1}`,
      studentId: studentIds[i] || `student-${instId}-${i + 1}`,
      msisdn,
      institutionId: instId,
      bundleId,
      bundleName: name,
      bundleSize: size,
      validFrom: createdAt,
      validUntil: addDays(createdAt, 30),
      source: 'spoc_upload' as const,
      provisioningResultId: `pr-${instId}-2-${i + 1}`,
      paymentId: `payment-${instId}-2`,
      createdAt,
    }
  })
}

/**
 * Generate self_purchase allocations — one per institution, from student 1 buying
 * a weekly bundle independently.
 */
function makeSelfPurchaseAllocation(instId: string): Allocation {
  const bundleId = 'bundle-all-weekly-500mb'
  const { name, size } = BUNDLE_META[bundleId]
  const msisdn = STUDENT_MSISDNS[instId][0]
  const studentId = STUDENT_IDS[instId][0]
  const createdAt = `2024-04-15T14:00:00.000Z`

  return {
    id: `alloc-self-${instId}-1`,
    studentId,
    msisdn,
    institutionId: instId,
    bundleId,
    bundleName: name,
    bundleSize: size,
    validFrom: createdAt,
    validUntil: addDays(createdAt, 7),
    source: 'self_purchase' as const,
    paymentId: `payment-self-${instId}-1`,
    createdAt,
  }
}

export const ALLOCATIONS: Allocation[] = [
  ...INST_IDS.flatMap(makeSpocAllocations),
  ...INST_IDS.map(makeSelfPurchaseAllocation),
]

/** Get allocations for a student */
export function getAllocationsByStudentId(studentId: string): Allocation[] {
  return ALLOCATIONS.filter((a) => a.studentId === studentId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

/** Get allocations for an institution */
export function getAllocationsByInstitution(institutionId: string): Allocation[] {
  return ALLOCATIONS.filter((a) => a.institutionId === institutionId)
}
