/**
 * VLDP Mock Data — Notifications
 *
 * Notification records for SPOC and Student users, covering all notification types:
 *   provisioning_complete, provisioning_partial, payment_failed,
 *   payment_success, upload_ready, system
 *
 * Requirements: 11.10, 5.9, 4.5
 */

import type { Notification } from '../types'

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

const STUDENT_1_IDS: Record<string, string> = {
  nul: 'user-nul-student-1',
  limkokwing: 'user-limkokwing-student-1',
  botho: 'user-botho-student-1',
  lerotholi: 'user-lerotholi-student-1',
  qoaling: 'user-qoaling-student-1',
  abia: 'user-abia-student-1',
  'little-darlings': 'user-little-darlings-student-1',
  tholoana: 'user-tholoana-student-1',
}

const INST_NAMES: Record<string, string> = {
  nul: 'NUL',
  limkokwing: 'Limkokwing University',
  botho: 'Botho University',
  lerotholi: 'Lerotholi Polytechnic',
  qoaling: 'Qoaling High School',
  abia: 'Abia High School',
  'little-darlings': 'Little Darlings',
  tholoana: 'Tholoana ea Bopheho',
}

let _seq = 0
function nextId(prefix: string): string {
  return `${prefix}-${++_seq}`
}

const NOTIFICATIONS: Notification[] = []

for (const instId of INST_IDS) {
  const instName = INST_NAMES[instId]
  const spocId = SPOC_IDS[instId]
  const studentId = STUDENT_1_IDS[instId]

  // ── SPOC notifications ────────────────────────────────────────────────────

  // provisioning_complete — triggered after a fully provisioned batch
  NOTIFICATIONS.push({
    id: nextId('notif'),
    recipientId: spocId,
    recipientRole: 'spoc',
    institutionId: instId,
    type: 'provisioning_complete',
    title: 'Provisioning Complete',
    message: `All 10 students in the latest upload for ${instName} have been provisioned successfully.`,
    metadata: { uploadId: `upload-${instId}-2`, succeeded: 10, failed: 0 },
    read: true,
    createdAt: '2024-04-10T08:35:00.000Z',
  })

  // provisioning_partial — triggered after a partial batch
  NOTIFICATIONS.push({
    id: nextId('notif'),
    recipientId: spocId,
    recipientRole: 'spoc',
    institutionId: instId,
    type: 'provisioning_partial',
    title: 'Provisioning Partially Complete',
    message: `7 of 10 students in the latest upload for ${instName} were provisioned. 3 failed and may be retried.`,
    metadata: { uploadId: `upload-${instId}-3`, succeeded: 7, failed: 3 },
    read: false,
    createdAt: '2024-05-10T08:35:00.000Z',
  })

  // payment_failed — triggered when M-Pesa returns non-zero result code
  NOTIFICATIONS.push({
    id: nextId('notif'),
    recipientId: spocId,
    recipientRole: 'spoc',
    institutionId: instId,
    type: 'payment_failed',
    title: 'Payment Failed',
    message: `Your M-Pesa payment for ${instName} upload was not completed. Please retry.`,
    metadata: { uploadId: `upload-${instId}-4`, paymentId: `payment-${instId}-4` },
    read: false,
    createdAt: '2024-06-14T08:06:00.000Z',
  })

  // payment_success — triggered on successful M-Pesa callback
  NOTIFICATIONS.push({
    id: nextId('notif'),
    recipientId: spocId,
    recipientRole: 'spoc',
    institutionId: instId,
    type: 'payment_success',
    title: 'Payment Successful',
    message: `Payment confirmed for ${instName}. Data provisioning has started.`,
    metadata: { paymentId: `payment-${instId}-2`, amount: 990 },
    read: true,
    createdAt: '2024-04-10T08:05:30.000Z',
  })

  // upload_ready — triggered after validation completes
  NOTIFICATIONS.push({
    id: nextId('notif'),
    recipientId: spocId,
    recipientRole: 'spoc',
    institutionId: instId,
    type: 'upload_ready',
    title: 'Upload Ready for Review',
    message: `Your file has been validated for ${instName}. Review results and confirm to proceed with payment.`,
    metadata: { uploadId: `upload-${instId}-1`, validRows: 10, invalidRows: 0 },
    read: true,
    createdAt: '2024-03-10T08:01:00.000Z',
  })

  // system — general system announcement
  NOTIFICATIONS.push({
    id: nextId('notif'),
    recipientId: spocId,
    recipientRole: 'spoc',
    institutionId: instId,
    type: 'system',
    title: 'Scheduled Maintenance',
    message:
      'The portal will be briefly unavailable on Saturday 14 December 2024 between 02:00 and 04:00 SAST for scheduled maintenance.',
    read: false,
    createdAt: '2024-12-10T12:00:00.000Z',
  })

  // ── Student notifications ─────────────────────────────────────────────────

  // provisioning_complete — student informed their bundle was provisioned
  NOTIFICATIONS.push({
    id: nextId('notif'),
    recipientId: studentId,
    recipientRole: 'student',
    institutionId: instId,
    type: 'provisioning_complete',
    title: 'Your Data Bundle is Active',
    message: `Your data bundle from ${instName} has been activated on your number. Enjoy!`,
    metadata: { bundleId: 'bundle-ter-5gb', bundleSize: '5 GB' },
    read: false,
    createdAt: '2024-04-10T08:36:00.000Z',
  })

  // payment_success — student self-purchased a bundle
  NOTIFICATIONS.push({
    id: nextId('notif'),
    recipientId: studentId,
    recipientRole: 'student',
    institutionId: instId,
    type: 'payment_success',
    title: 'Purchase Successful',
    message: `You have successfully purchased the Weekly 500 MB bundle. It is now active on your number.`,
    metadata: { bundleId: 'bundle-all-weekly-500mb', amount: 8 },
    read: true,
    createdAt: '2024-04-15T14:01:00.000Z',
  })

  // system — general student-facing system notice
  NOTIFICATIONS.push({
    id: nextId('notif'),
    recipientId: studentId,
    recipientRole: 'student',
    institutionId: instId,
    type: 'system',
    title: 'Complete Your Registration',
    message:
      'Please complete your registration by providing consent to start receiving data allocations from your school.',
    read: false,
    createdAt: '2024-02-02T08:00:00.000Z',
  })
}

export const NOTIFICATIONS_STORE: Notification[] = NOTIFICATIONS

/** Get notifications for a recipient, newest first */
export function getNotificationsForUser(recipientId: string): Notification[] {
  return NOTIFICATIONS_STORE.filter((n) => n.recipientId === recipientId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

/** Count unread notifications for a recipient */
export function getUnreadCount(recipientId: string): number {
  return NOTIFICATIONS_STORE.filter(
    (n) => n.recipientId === recipientId && !n.read
  ).length
}
