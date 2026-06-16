/**
 * VLAP Mock Data — Payments
 *
 * One Payment record per Upload record (one-to-one correspondence).
 * Payment statuses mirror their upload statuses:
 *   upload pending_payment  → payment pending
 *   upload provisioned      → payment success
 *   upload partial          → payment success  (partial provisioning, not payment failure)
 *   upload payment_failed   → payment failed
 *   upload cancelled        → payment cancelled
 *
 * Requirements: 11.4, 4.1–4.6
 */

import type { Payment } from '../types'

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

const SPOC_MSISDNS: Record<string, string> = {
  nul: '+26657300001',
  limkokwing: '+26657300002',
  botho: '+26657300003',
  lerotholi: '+26658300001',
  qoaling: '+26658300002',
  abia: '+26659300001',
  'little-darlings': '+26659300002',
  tholoana: '+26659300003',
}

const MERCHANT_MSISDNS: Record<string, string> = {
  nul: '+26657100001',
  limkokwing: '+26657100002',
  botho: '+26657100003',
  lerotholi: '+26657100004',
  qoaling: '+26657100005',
  abia: '+26657100006',
  'little-darlings': '+26657100007',
  tholoana: '+26657100008',
}

// Amount per bundle (LSL)
const AMOUNTS_BY_INST: Record<string, number> = {
  nul: 990,        // 10 × 99 LSL (5GB bundle)
  limkokwing: 650, // 10 × 65 LSL (3GB bundle)
  botho: 650,
  lerotholi: 990,
  qoaling: 225,    // 9 × 25 LSL (1GB secondary)
  abia: 405,       // 9 × 45 LSL (2GB secondary)
  'little-darlings': 162, // 9 × 18 LSL (500MB primary)
  tholoana: 270,   // 9 × 30 LSL (1GB primary)
}

type PaymentStatus = Payment['status']

// Upload statuses → payment statuses
const PAYMENT_STATUS_MAP: PaymentStatus[] = [
  'pending',    // upload: pending_payment
  'success',    // upload: provisioned
  'success',    // upload: partial
  'failed',     // upload: payment_failed
  'cancelled',  // upload: cancelled
]

function makePayment(instId: string, idx: number): Payment {
  const paymentStatus = PAYMENT_STATUS_MAP[idx]
  const uploadedAt = `2024-0${3 + idx}-${10 + idx}T08:00:00.000Z`
  const updatedAt = `2024-0${3 + idx}-${10 + idx}T08:05:00.000Z`

  return {
    id: `payment-${instId}-${idx + 1}`,
    uploadId: `upload-${instId}-${idx + 1}`,
    spocId: SPOC_IDS[instId],
    institutionId: instId,
    payerMSISDN: SPOC_MSISDNS[instId],
    merchantMSISDN: MERCHANT_MSISDNS[instId],
    amount: AMOUNTS_BY_INST[instId],
    checkoutRequestId: `ws_CO_${instId.toUpperCase()}_${idx + 1}_${Date.now()}`,
    mpesaReceiptNumber:
      paymentStatus === 'success' ? `LK${instId.toUpperCase()}${idx}${Date.now()}` : undefined,
    status: paymentStatus,
    resultCode: paymentStatus === 'success' ? 0 : paymentStatus === 'failed' ? 1032 : undefined,
    resultDesc:
      paymentStatus === 'success'
        ? 'The service request is processed successfully.'
        : paymentStatus === 'failed'
        ? 'Request cancelled by user.'
        : undefined,
    createdAt: uploadedAt,
    updatedAt,
  }
}

// Generate payments for all uploads (5 per institution × 8 = 40)
// Upload index 0 (pending_payment) technically has no payment yet — we still
// create the Payment record in 'pending' state to represent the initiated STK push.
export const PAYMENTS: Payment[] = INST_IDS.flatMap((instId) =>
  [0, 1, 2, 3, 4].map((idx) => makePayment(instId, idx))
)

/** Get payment by uploadId */
export function getPaymentByUploadId(uploadId: string): Payment | undefined {
  return PAYMENTS.find((p) => p.uploadId === uploadId)
}

/** Get payment by id */
export function getPaymentById(id: string): Payment | undefined {
  return PAYMENTS.find((p) => p.id === id)
}

/** Get payment by checkoutRequestId */
export function getPaymentByCheckoutRequestId(
  checkoutRequestId: string
): Payment | undefined {
  return PAYMENTS.find((p) => p.checkoutRequestId === checkoutRequestId)
}
