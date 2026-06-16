/**
 * MpesaService — M-Pesa STK Push integration (mock implementation)
 *
 * Provides:
 *   - initiateSTKPush    — simulate STK Push, save pending Payment record
 *   - handleCallback     — process M-Pesa callback, update Payment/Upload, trigger provisioning
 *   - getPaymentStatus   — look up a Payment by checkoutRequestId
 *   - simulatePaymentResult — dev/demo: immediately resolve STK Push as success or failure
 *
 * A 90-second timeout is set after each STK Push; if no callback arrives, the
 * Payment and Upload are both marked as failed.
 *
 * Requirements: 4.1–4.6, 5.1, 5.2
 */

import type {
  MpesaCallbackPayload,
  Payment,
  STKPushRequest,
  STKPushResponse,
} from './types'
import { PAYMENTS } from './mock-data/payments'
import { logAudit } from './audit'
import { getUploadById } from './upload'
import { NOTIFICATIONS_STORE } from './mock-data/notifications'

// ---------------------------------------------------------------------------
// In-memory store — seeded from mock data
// ---------------------------------------------------------------------------

const store: Payment[] = [...PAYMENTS]

// Track active timeout handles keyed by checkoutRequestId
const pendingTimeouts = new Map<string, ReturnType<typeof setTimeout>>()

// ---------------------------------------------------------------------------
// triggerProvisioningForUpload — stub (wired in task 19.2)
// ---------------------------------------------------------------------------

/**
 * Stub that will be replaced with the real provisioning call in task 19.2.
 * Exported so task 19.2 can re-assign or wrap it.
 *
 * Requirements: 5.1, 5.2
 */
export async function triggerProvisioningForUpload(uploadId: string): Promise<void> {
  // Stub — real implementation injected in task 19.2
  console.log(`[mpesa] triggerProvisioningForUpload called for uploadId=${uploadId}`)
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function findPayment(checkoutRequestId: string): Payment | undefined {
  return store.find((p) => p.checkoutRequestId === checkoutRequestId)
}

/**
 * Notify the SPOC about a payment outcome by pushing a Notification record
 * into the in-memory notifications store.
 *
 * Requirements: 4.5, 5.2
 */
function notifySpoc(
  spocId: string,
  institutionId: string,
  type: 'payment_success' | 'payment_failed',
  uploadId: string,
  paymentId: string,
  amount: number,
): void {
  const isSuccess = type === 'payment_success'

  NOTIFICATIONS_STORE.push({
    id: crypto.randomUUID(),
    recipientId: spocId,
    recipientRole: 'spoc',
    institutionId,
    type,
    title: isSuccess ? 'Payment Successful' : 'Payment Failed',
    message: isSuccess
      ? `Payment confirmed. Data provisioning has started.`
      : `Your M-Pesa payment was not completed. Please retry.`,
    metadata: { uploadId, paymentId, amount },
    read: false,
    createdAt: new Date().toISOString(),
  })
}

/**
 * Cancel the pending 90-second timeout for a checkout request.
 */
function clearPendingTimeout(checkoutRequestId: string): void {
  const handle = pendingTimeouts.get(checkoutRequestId)
  if (handle !== undefined) {
    clearTimeout(handle)
    pendingTimeouts.delete(checkoutRequestId)
  }
}

/**
 * Start the 90-second timeout for a newly initiated STK Push.
 * If no callback is received within 90 s, marks Payment as failed and
 * Upload as payment_failed.
 *
 * Requirements: 4.6
 */
function startTimeoutTimer(checkoutRequestId: string): void {
  const handle = setTimeout(async () => {
    pendingTimeouts.delete(checkoutRequestId)

    const payment = findPayment(checkoutRequestId)
    if (!payment || payment.status !== 'pending') return

    const now = new Date().toISOString()

    // Mark payment failed
    payment.status = 'failed'
    payment.resultCode = 1037
    payment.resultDesc = 'STK Push timeout — no callback received within 90 seconds.'
    payment.updatedAt = now

    // Mark upload payment_failed
    const upload = getUploadById(payment.uploadId)
    if (upload) {
      upload.status = 'payment_failed'
    }

    // Audit
    logAudit('PAYMENT_FAILED', 'system', {
      actorRole: 'spoc',
      institutionId: payment.institutionId,
      targetId: payment.id,
      targetType: 'payment',
      metadata: {
        checkoutRequestId,
        reason: 'timeout',
        uploadId: payment.uploadId,
      },
    })

    // Notify SPOC
    notifySpoc(
      payment.spocId,
      payment.institutionId,
      'payment_failed',
      payment.uploadId,
      payment.id,
      payment.amount,
    )
  }, 90_000)

  pendingTimeouts.set(checkoutRequestId, handle)
}

// ---------------------------------------------------------------------------
// initiateSTKPush
// ---------------------------------------------------------------------------

/**
 * Simulate initiating an M-Pesa STK Push.
 *
 * - Waits 500 ms (mock network latency)
 * - Generates a unique checkoutRequestId
 * - Creates a Payment record with status `pending`
 * - Schedules a 90-second timeout
 * - Returns STKPushResponse
 *
 * Requirements: 4.1, 4.2, 4.6
 */
export async function initiateSTKPush(req: STKPushRequest): Promise<STKPushResponse> {
  // Simulate network latency
  await new Promise<void>((resolve) => setTimeout(resolve, 500))

  const now = new Date().toISOString()
  const checkoutRequestId = `ws_CO_${req.reference.toUpperCase()}_${Date.now()}`
  const merchantRequestId = `MR_${crypto.randomUUID().replace(/-/g, '').slice(0, 12).toUpperCase()}`

  // Build Payment record
  const payment: Payment = {
    id: crypto.randomUUID(),
    uploadId: req.reference,
    spocId: '',           // caller must patch spocId after creation (see initiate route)
    institutionId: '',    // caller must patch institutionId after creation
    payerMSISDN: req.payerMSISDN,
    merchantMSISDN: req.merchantMSISDN,
    amount: req.amount,
    checkoutRequestId,
    status: 'pending',
    createdAt: now,
    updatedAt: now,
  }

  store.push(payment)

  // Arm the 90-second timeout (req 4.6)
  startTimeoutTimer(checkoutRequestId)

  return {
    checkoutRequestId,
    merchantRequestId,
    responseCode: '0',
    responseDescription: 'Success. Request accepted for processing',
  }
}

// ---------------------------------------------------------------------------
// handleCallback
// ---------------------------------------------------------------------------

/**
 * Process an incoming M-Pesa callback payload.
 *
 * - Finds the matching Payment by checkoutRequestId
 * - Cancels the 90-second timeout
 * - Updates Payment status (success / failed)
 * - On success: triggers provisioning, updates Upload status, creates audit
 *   entries, notifies the SPOC
 * - On failure: updates Upload to payment_failed, creates audit entry, notifies SPOC
 *
 * Requirements: 4.3, 4.4, 4.5, 5.1, 5.2
 */
export async function handleCallback(
  payload: MpesaCallbackPayload,
): Promise<Payment> {
  const payment = findPayment(payload.checkoutRequestId)

  if (!payment) {
    throw new Error(`Payment not found for checkoutRequestId: ${payload.checkoutRequestId}`)
  }

  // Cancel the pending timeout — callback arrived
  clearPendingTimeout(payload.checkoutRequestId)

  const now = new Date().toISOString()
  const isSuccess = payload.resultCode === 0

  // Update Payment
  payment.status = isSuccess ? 'success' : 'failed'
  payment.resultCode = payload.resultCode
  payment.resultDesc = payload.resultDesc
  payment.updatedAt = now

  if (isSuccess) {
    if (payload.mpesaReceiptNumber) {
      payment.mpesaReceiptNumber = payload.mpesaReceiptNumber
    }

    // Update Upload status → provisioning
    const upload = getUploadById(payment.uploadId)
    if (upload) {
      upload.status = 'provisioning'
      upload.paymentId = payment.id
    }

    // Audit: payment success
    logAudit('PAYMENT_SUCCESS', payment.spocId || 'system', {
      actorRole: 'spoc',
      institutionId: payment.institutionId,
      targetId: payment.id,
      targetType: 'payment',
      metadata: {
        checkoutRequestId: payload.checkoutRequestId,
        mpesaReceiptNumber: payload.mpesaReceiptNumber,
        amount: payment.amount,
        uploadId: payment.uploadId,
      },
    })

    // Audit: provisioning started
    logAudit('PROVISIONING_STARTED', payment.spocId || 'system', {
      actorRole: 'spoc',
      institutionId: payment.institutionId,
      targetId: payment.uploadId,
      targetType: 'upload',
      metadata: { paymentId: payment.id },
    })

    // Notify SPOC: payment success
    notifySpoc(
      payment.spocId,
      payment.institutionId,
      'payment_success',
      payment.uploadId,
      payment.id,
      payment.amount,
    )

    // Trigger provisioning (stub — wired in task 19.2)
    await triggerProvisioningForUpload(payment.uploadId)
  } else {
    // Update Upload status → payment_failed
    const upload = getUploadById(payment.uploadId)
    if (upload) {
      upload.status = 'payment_failed'
    }

    // Audit: payment failed
    logAudit('PAYMENT_FAILED', payment.spocId || 'system', {
      actorRole: 'spoc',
      institutionId: payment.institutionId,
      targetId: payment.id,
      targetType: 'payment',
      metadata: {
        checkoutRequestId: payload.checkoutRequestId,
        resultCode: payload.resultCode,
        resultDesc: payload.resultDesc,
        uploadId: payment.uploadId,
      },
    })

    // Notify SPOC: payment failed
    notifySpoc(
      payment.spocId,
      payment.institutionId,
      'payment_failed',
      payment.uploadId,
      payment.id,
      payment.amount,
    )
  }

  return payment
}

// ---------------------------------------------------------------------------
// getPaymentStatus
// ---------------------------------------------------------------------------

/**
 * Look up a Payment record by its checkoutRequestId.
 * Returns `undefined` if not found.
 *
 * Requirements: 4.3
 */
export async function getPaymentStatus(
  checkoutRequestId: string,
): Promise<Payment | undefined> {
  return findPayment(checkoutRequestId)
}

// ---------------------------------------------------------------------------
// simulatePaymentResult (dev/mock only)
// ---------------------------------------------------------------------------

/**
 * Immediately simulates a payment success or failure for the most recent
 * pending Payment associated with the given uploadId. Intended for the demo
 * flow only — never call this in production.
 *
 * Requirements: 4.1 (demo/mock support)
 */
export async function simulatePaymentResult(
  uploadId: string,
  success: boolean,
): Promise<void> {
  // Find the most recent pending payment for this upload
  const payment = [...store]
    .reverse()
    .find((p) => p.uploadId === uploadId && p.status === 'pending')

  if (!payment) {
    throw new Error(`No pending payment found for uploadId: ${uploadId}`)
  }

  const mockPayload: MpesaCallbackPayload = success
    ? {
        checkoutRequestId: payment.checkoutRequestId,
        resultCode: 0,
        resultDesc: 'The service request is processed successfully.',
        amount: payment.amount,
        mpesaReceiptNumber: `SIM${Date.now()}`,
        transactionDate: new Date().toISOString(),
      }
    : {
        checkoutRequestId: payment.checkoutRequestId,
        resultCode: 1032,
        resultDesc: 'Request cancelled by user.',
      }

  await handleCallback(mockPayload)
}
