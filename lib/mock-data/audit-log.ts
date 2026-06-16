/**
 * VLAP Mock Data — AuditLog
 *
 * Covers all 18 defined AuditAction types:
 *   LOGIN, LOGOUT, UPLOAD_CREATED, UPLOAD_CONFIRMED, UPLOAD_CANCELLED,
 *   PAYMENT_INITIATED, PAYMENT_SUCCESS, PAYMENT_FAILED,
 *   PROVISIONING_STARTED, PROVISIONING_COMPLETE, PROVISIONING_RETRY,
 *   STUDENT_REGISTERED, CONSENT_UPDATED, OPT_IN_UPDATED,
 *   ADMIN_USER_CREATED, ADMIN_USER_DEACTIVATED,
 *   SETTINGS_UPDATED, REPORT_EXPORTED
 *
 * Requirements: 11.9, 14.1–14.5
 */

import type { AuditEntry, AuditAction } from '../types'

// Covers the NUL institution; additional entries span all 8 institutions
const ENTRIES: AuditEntry[] = [
  // ── Authentication ─────────────────────────────────────────────────────────
  {
    id: 'audit-001',
    action: 'LOGIN',
    actorId: 'user-nul-admin',
    actorRole: 'admin',
    institutionId: 'nul',
    targetId: 'user-nul-admin',
    targetType: 'user',
    metadata: { ip: '196.10.1.1' },
    ipAddress: '196.10.1.1',
    timestamp: '2024-12-01T08:00:00.000Z',
  },
  {
    id: 'audit-002',
    action: 'LOGOUT',
    actorId: 'user-nul-admin',
    actorRole: 'admin',
    institutionId: 'nul',
    targetId: 'user-nul-admin',
    targetType: 'user',
    ipAddress: '196.10.1.1',
    timestamp: '2024-12-01T17:00:00.000Z',
  },
  {
    id: 'audit-003',
    action: 'LOGIN',
    actorId: 'user-nul-spoc',
    actorRole: 'spoc',
    institutionId: 'nul',
    targetId: 'user-nul-spoc',
    targetType: 'user',
    ipAddress: '196.10.1.5',
    timestamp: '2024-12-01T08:30:00.000Z',
  },

  // ── Upload lifecycle ────────────────────────────────────────────────────────
  {
    id: 'audit-010',
    action: 'UPLOAD_CREATED',
    actorId: 'user-nul-spoc',
    actorRole: 'spoc',
    institutionId: 'nul',
    targetId: 'upload-nul-1',
    targetType: 'upload',
    metadata: { fileName: 'students-batch-1.csv', totalRows: 10 },
    ipAddress: '196.10.1.5',
    timestamp: '2024-03-10T08:00:00.000Z',
  },
  {
    id: 'audit-011',
    action: 'UPLOAD_CONFIRMED',
    actorId: 'user-nul-spoc',
    actorRole: 'spoc',
    institutionId: 'nul',
    targetId: 'upload-nul-1',
    targetType: 'upload',
    metadata: { validRows: 10, paymentAmount: 990 },
    ipAddress: '196.10.1.5',
    timestamp: '2024-03-10T08:02:00.000Z',
  },
  {
    id: 'audit-012',
    action: 'UPLOAD_CANCELLED',
    actorId: 'user-nul-spoc',
    actorRole: 'spoc',
    institutionId: 'nul',
    targetId: 'upload-nul-5',
    targetType: 'upload',
    metadata: { reason: 'SPOC cancelled after validation review' },
    ipAddress: '196.10.1.5',
    timestamp: '2024-07-14T09:00:00.000Z',
  },

  // ── Payment lifecycle ───────────────────────────────────────────────────────
  {
    id: 'audit-020',
    action: 'PAYMENT_INITIATED',
    actorId: 'user-nul-spoc',
    actorRole: 'spoc',
    institutionId: 'nul',
    targetId: 'payment-nul-2',
    targetType: 'payment',
    metadata: { amount: 990, payerMSISDN: '+26657300001' },
    ipAddress: '196.10.1.5',
    timestamp: '2024-04-10T08:03:00.000Z',
  },
  {
    id: 'audit-021',
    action: 'PAYMENT_SUCCESS',
    actorId: 'user-nul-spoc',
    actorRole: 'spoc',
    institutionId: 'nul',
    targetId: 'payment-nul-2',
    targetType: 'payment',
    metadata: { mpesaReceiptNumber: 'LKNUL20000', resultCode: 0 },
    timestamp: '2024-04-10T08:05:00.000Z',
  },
  {
    id: 'audit-022',
    action: 'PAYMENT_FAILED',
    actorId: 'user-nul-spoc',
    actorRole: 'spoc',
    institutionId: 'nul',
    targetId: 'payment-nul-4',
    targetType: 'payment',
    metadata: { resultCode: 1032, resultDesc: 'Request cancelled by user.' },
    timestamp: '2024-06-14T08:05:00.000Z',
  },

  // ── Provisioning lifecycle ─────────────────────────────────────────────────
  {
    id: 'audit-030',
    action: 'PROVISIONING_STARTED',
    actorId: 'user-nul-admin',
    actorRole: 'admin',
    institutionId: 'nul',
    targetId: 'upload-nul-2',
    targetType: 'upload',
    metadata: { totalRows: 10 },
    timestamp: '2024-04-10T08:06:00.000Z',
  },
  {
    id: 'audit-031',
    action: 'PROVISIONING_COMPLETE',
    actorId: 'user-nul-admin',
    actorRole: 'admin',
    institutionId: 'nul',
    targetId: 'upload-nul-2',
    targetType: 'upload',
    metadata: { succeeded: 10, failed: 0, status: 'provisioned' },
    timestamp: '2024-04-10T08:30:00.000Z',
  },
  {
    id: 'audit-032',
    action: 'PROVISIONING_RETRY',
    actorId: 'user-nul-admin',
    actorRole: 'admin',
    institutionId: 'nul',
    targetId: 'upload-nul-3',
    targetType: 'upload',
    metadata: {
      targetMSISDNs: ['+26657280008'],
      retryCount: 1,
    },
    timestamp: '2024-05-11T09:00:00.000Z',
  },

  // ── Student lifecycle ──────────────────────────────────────────────────────
  {
    id: 'audit-040',
    action: 'STUDENT_REGISTERED',
    actorId: 'user-nul-student-1',
    actorRole: 'student',
    institutionId: 'nul',
    targetId: 'student-nul-1',
    targetType: 'student',
    metadata: { msisdn: '+26657210001' },
    timestamp: '2024-02-01T10:00:00.000Z',
  },
  {
    id: 'audit-041',
    action: 'CONSENT_UPDATED',
    actorId: 'user-nul-student-1',
    actorRole: 'student',
    institutionId: 'nul',
    targetId: 'student-nul-1',
    targetType: 'student',
    metadata: { consentGiven: true },
    timestamp: '2024-02-05T10:00:00.000Z',
  },
  {
    id: 'audit-042',
    action: 'OPT_IN_UPDATED',
    actorId: 'user-nul-student-1',
    actorRole: 'student',
    institutionId: 'nul',
    targetId: 'student-nul-1',
    targetType: 'student',
    metadata: { optIn: true },
    timestamp: '2024-02-05T10:01:00.000Z',
  },

  // ── Admin user management ──────────────────────────────────────────────────
  {
    id: 'audit-050',
    action: 'ADMIN_USER_CREATED',
    actorId: 'user-nul-admin',
    actorRole: 'admin',
    institutionId: 'nul',
    targetId: 'user-nul-spoc',
    targetType: 'user',
    metadata: { role: 'spoc', email: 'spoc@nul.ac.ls' },
    timestamp: '2024-01-15T08:00:00.000Z',
  },
  {
    id: 'audit-051',
    action: 'ADMIN_USER_DEACTIVATED',
    actorId: 'user-limkokwing-admin',
    actorRole: 'admin',
    institutionId: 'limkokwing',
    targetId: 'user-limkokwing-spoc',
    targetType: 'user',
    metadata: { reason: 'Resigned from institution' },
    timestamp: '2024-11-01T09:00:00.000Z',
  },

  // ── Settings and reports ───────────────────────────────────────────────────
  {
    id: 'audit-060',
    action: 'SETTINGS_UPDATED',
    actorId: 'user-botho-admin',
    actorRole: 'admin',
    institutionId: 'botho',
    metadata: { field: 'merchantMSISDN', newValue: '+26657100003' },
    timestamp: '2024-11-15T10:30:00.000Z',
  },
  {
    id: 'audit-061',
    action: 'REPORT_EXPORTED',
    actorId: 'user-lerotholi-admin',
    actorRole: 'admin',
    institutionId: 'lerotholi',
    metadata: { reportType: 'provisioning', period: 'month', format: 'csv' },
    timestamp: '2024-11-30T16:00:00.000Z',
  },

  // Additional entries for other institutions to give volume
  {
    id: 'audit-100',
    action: 'LOGIN',
    actorId: 'user-limkokwing-spoc',
    actorRole: 'spoc',
    institutionId: 'limkokwing',
    ipAddress: '196.10.2.1',
    timestamp: '2024-12-01T08:35:00.000Z',
  },
  {
    id: 'audit-101',
    action: 'UPLOAD_CONFIRMED',
    actorId: 'user-limkokwing-spoc',
    actorRole: 'spoc',
    institutionId: 'limkokwing',
    targetId: 'upload-limkokwing-2',
    targetType: 'upload',
    metadata: { validRows: 10, paymentAmount: 650 },
    timestamp: '2024-04-10T08:02:00.000Z',
  },
  {
    id: 'audit-102',
    action: 'PAYMENT_INITIATED',
    actorId: 'user-limkokwing-spoc',
    actorRole: 'spoc',
    institutionId: 'limkokwing',
    targetId: 'payment-limkokwing-2',
    targetType: 'payment',
    metadata: { amount: 650 },
    timestamp: '2024-04-10T08:03:00.000Z',
  },
  {
    id: 'audit-103',
    action: 'PAYMENT_SUCCESS',
    actorId: 'user-limkokwing-spoc',
    actorRole: 'spoc',
    institutionId: 'limkokwing',
    targetId: 'payment-limkokwing-2',
    targetType: 'payment',
    metadata: { resultCode: 0 },
    timestamp: '2024-04-10T08:05:00.000Z',
  },
  {
    id: 'audit-104',
    action: 'PROVISIONING_STARTED',
    actorId: 'user-limkokwing-admin',
    actorRole: 'admin',
    institutionId: 'limkokwing',
    targetId: 'upload-limkokwing-2',
    targetType: 'upload',
    timestamp: '2024-04-10T08:06:00.000Z',
  },
  {
    id: 'audit-105',
    action: 'PROVISIONING_COMPLETE',
    actorId: 'user-limkokwing-admin',
    actorRole: 'admin',
    institutionId: 'limkokwing',
    targetId: 'upload-limkokwing-2',
    targetType: 'upload',
    metadata: { succeeded: 10, failed: 0 },
    timestamp: '2024-04-10T08:28:00.000Z',
  },
  {
    id: 'audit-106',
    action: 'STUDENT_REGISTERED',
    actorId: 'user-limkokwing-student-1',
    actorRole: 'student',
    institutionId: 'limkokwing',
    targetId: 'student-limkokwing-1',
    targetType: 'student',
    timestamp: '2024-02-01T10:00:00.000Z',
  },
  {
    id: 'audit-107',
    action: 'CONSENT_UPDATED',
    actorId: 'user-limkokwing-student-1',
    actorRole: 'student',
    institutionId: 'limkokwing',
    targetId: 'student-limkokwing-1',
    targetType: 'student',
    metadata: { consentGiven: true },
    timestamp: '2024-02-06T10:00:00.000Z',
  },
  {
    id: 'audit-108',
    action: 'OPT_IN_UPDATED',
    actorId: 'user-botho-student-2',
    actorRole: 'student',
    institutionId: 'botho',
    targetId: 'student-botho-2',
    targetType: 'student',
    metadata: { optIn: false },
    timestamp: '2024-03-01T11:00:00.000Z',
  },
  {
    id: 'audit-109',
    action: 'PROVISIONING_RETRY',
    actorId: 'user-qoaling-admin',
    actorRole: 'admin',
    institutionId: 'qoaling',
    targetId: 'upload-qoaling-3',
    targetType: 'upload',
    metadata: { targetMSISDNs: ['+26659280008'], retryCount: 1 },
    timestamp: '2024-05-12T09:00:00.000Z',
  },
  {
    id: 'audit-110',
    action: 'REPORT_EXPORTED',
    actorId: 'user-abia-admin',
    actorRole: 'admin',
    institutionId: 'abia',
    metadata: { reportType: 'audit-log', period: 'year', format: 'xlsx' },
    timestamp: '2024-11-30T17:00:00.000Z',
  },
  {
    id: 'audit-111',
    action: 'UPLOAD_CANCELLED',
    actorId: 'user-tholoana-spoc',
    actorRole: 'spoc',
    institutionId: 'tholoana',
    targetId: 'upload-tholoana-5',
    targetType: 'upload',
    metadata: { reason: 'Wrong file uploaded' },
    timestamp: '2024-07-14T09:00:00.000Z',
  },
]

// Verify at runtime that all 18 action types are present
const _ALL_ACTIONS: AuditAction[] = [
  'LOGIN', 'LOGOUT',
  'UPLOAD_CREATED', 'UPLOAD_CONFIRMED', 'UPLOAD_CANCELLED',
  'PAYMENT_INITIATED', 'PAYMENT_SUCCESS', 'PAYMENT_FAILED',
  'PROVISIONING_STARTED', 'PROVISIONING_COMPLETE', 'PROVISIONING_RETRY',
  'STUDENT_REGISTERED', 'CONSENT_UPDATED', 'OPT_IN_UPDATED',
  'ADMIN_USER_CREATED', 'ADMIN_USER_DEACTIVATED',
  'SETTINGS_UPDATED', 'REPORT_EXPORTED',
]

const _presentActions = new Set(ENTRIES.map((e) => e.action))
_ALL_ACTIONS.forEach((action) => {
  if (!_presentActions.has(action)) {
    console.warn(`[mock-data/audit-log] Missing AuditEntry for action: ${action}`)
  }
})

export const AUDIT_LOG: AuditEntry[] = ENTRIES

/** Query audit entries — basic in-memory filter */
export function queryAuditLog(filters: {
  institutionId?: string
  actorId?: string
  action?: AuditAction
  fromDate?: string
  toDate?: string
}): AuditEntry[] {
  return AUDIT_LOG.filter((e) => {
    if (filters.institutionId && e.institutionId !== filters.institutionId) return false
    if (filters.actorId && e.actorId !== filters.actorId) return false
    if (filters.action && e.action !== filters.action) return false
    if (filters.fromDate && e.timestamp < filters.fromDate) return false
    if (filters.toDate && e.timestamp > filters.toDate) return false
    return true
  }).sort((a, b) => b.timestamp.localeCompare(a.timestamp))
}
