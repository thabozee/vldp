/**
 * VLDP — Vodacom Lesotho Data Provisioning Portal
 * Central TypeScript type definitions
 *
 * Requirements: 11.1, 2.1, 3.7, 5.5, 14.2
 */

// ---------------------------------------------------------------------------
// Primitive aliases
// ---------------------------------------------------------------------------

export type UserRole = 'admin' | 'spoc' | 'student'

// ---------------------------------------------------------------------------
// Domain: Institution
// ---------------------------------------------------------------------------

export interface Institution {
  id: string                        // e.g. "nul"
  slug: string                      // URL segment e.g. "national-university-of-lesotho"
  name: string                      // "National University of Lesotho"
  shortName: string                 // "NUL"
  type: 'tertiary' | 'secondary' | 'primary'
  primaryColor: string              // hex color override e.g. "#E40000"
  logoUrl: string                   // path under /public/logos/
  faviconUrl: string
  merchantMSISDN: string            // school's M-Pesa merchant number
  vodacomMerchantMSISDN: string     // Vodacom LS merchant number
  active: boolean
  createdAt: string                 // ISO 8601
}

// Subset used by InstitutionThemeProvider context
export interface InstitutionBranding {
  id: string
  slug: string
  name: string
  shortName: string
  type: 'tertiary' | 'secondary' | 'primary'
  primaryColor: string
  logoUrl: string
  faviconUrl: string
}

export interface InstitutionContextValue {
  institution: InstitutionBranding
  isLoading: boolean
}

// ---------------------------------------------------------------------------
// Domain: User
// ---------------------------------------------------------------------------

export interface User {
  id: string
  email: string
  passwordHash: string              // mock: plaintext for dev
  name: string
  role: UserRole
  institutionId: string
  active: boolean
  createdAt: string                 // ISO 8601
  lastLoginAt?: string              // ISO 8601
}

// ---------------------------------------------------------------------------
// Domain: Student
// ---------------------------------------------------------------------------

export interface Student {
  id: string
  userId: string                    // links to User record
  name: string
  msisdn: string                    // primary phone / provisioning target
  institutionId: string
  grade?: string
  optIn: boolean
  consentGiven: boolean
  consentDate?: string              // ISO 8601
  status: 'active' | 'suspended' | 'pending_registration'
  registeredBy: 'self' | 'admin' | 'spoc'
  registrationDate: string          // ISO 8601
  currentBundleId?: string
  dataBalance?: string              // display string e.g. "2.5 GB remaining"
}

// ---------------------------------------------------------------------------
// Domain: Upload
// ---------------------------------------------------------------------------

export interface Upload {
  id: string
  institutionId: string
  spocId: string
  fileName: string
  totalRows: number
  validRows: number
  invalidRows: number
  status:
    | 'validating'
    | 'pending_payment'
    | 'payment_pending'
    | 'payment_failed'
    | 'provisioning'
    | 'provisioned'
    | 'partial'
    | 'cancelled'
  paymentId?: string
  bundleId: string
  uploadedAt: string                // ISO 8601
  processedAt?: string              // ISO 8601
}

// ---------------------------------------------------------------------------
// Domain: Payment
// ---------------------------------------------------------------------------

export interface Payment {
  id: string
  uploadId: string
  spocId: string
  institutionId: string
  payerMSISDN: string
  merchantMSISDN: string
  amount: number                    // in LSL (Lesotho Loti)
  checkoutRequestId: string
  mpesaReceiptNumber?: string
  status: 'pending' | 'success' | 'failed' | 'cancelled'
  resultCode?: number
  resultDesc?: string
  createdAt: string                 // ISO 8601
  updatedAt: string                 // ISO 8601
}

// ---------------------------------------------------------------------------
// Domain: ProvisioningResult
// ---------------------------------------------------------------------------

export interface ProvisioningResult {
  id: string
  uploadId: string
  paymentId: string
  studentId: string
  msisdn: string
  institutionId: string
  bundleId: string
  status: 'success' | 'failed' | 'pending' | 'retrying'
  errorCode?: string
  errorMessage?: string
  transactionId?: string            // Vodacom Core transaction ref
  provisionedAt?: string            // ISO 8601
  retryCount: number
  createdAt: string                 // ISO 8601
}

// Aggregated result returned from provisionBatch / retryFailed
export interface BatchProvisioningResult {
  uploadId: string
  total: number
  succeeded: number
  failed: number
  results: ProvisioningResult[]
}

// ---------------------------------------------------------------------------
// Domain: Allocation
// ---------------------------------------------------------------------------

export interface Allocation {
  id: string
  studentId: string
  msisdn: string
  institutionId: string
  bundleId: string
  bundleName: string
  bundleSize: string                // e.g. "5 GB"
  validFrom: string                 // ISO 8601
  validUntil: string                // ISO 8601
  source: 'spoc_upload' | 'self_purchase'
  provisioningResultId?: string
  paymentId?: string
  createdAt: string                 // ISO 8601
}

// ---------------------------------------------------------------------------
// Domain: DataBundle
// ---------------------------------------------------------------------------

export interface DataBundle {
  id: string
  name: string                      // e.g. "Student Monthly 5GB"
  size: string                      // "5 GB"
  sizeBytes: number
  price: number                     // LSL
  validityDays: number
  description: string
  targetTiers: Array<'tertiary' | 'secondary' | 'primary'>
  active: boolean
}

// ---------------------------------------------------------------------------
// Domain: DashboardStats
// ---------------------------------------------------------------------------

export interface DashboardStats {
  institutionId: string | 'all'
  period: 'day' | 'week' | 'month' | 'year'
  generatedAt: string               // ISO 8601
  summary: {
    totalAllocations: number
    successRate: number             // 0–1
    totalStudentsProvisioned: number
    totalPaymentsProcessed: number
    totalRevenueLSL: number
    failedProvisioningCount: number
    pendingRetryCount: number
  }
  allocationsOverTime: Array<{
    date: string
    count: number
    institutionId?: string
  }>
  successFailureByInstitution: Array<{
    institutionId: string
    institutionName: string
    success: number
    failed: number
  }>
  paymentStatusBreakdown: Array<{
    status: string
    count: number
  }>
}

// ---------------------------------------------------------------------------
// Domain: Audit
// ---------------------------------------------------------------------------

export type AuditAction =
  | 'LOGIN'
  | 'LOGOUT'
  | 'UPLOAD_CREATED'
  | 'UPLOAD_CONFIRMED'
  | 'UPLOAD_CANCELLED'
  | 'PAYMENT_INITIATED'
  | 'PAYMENT_SUCCESS'
  | 'PAYMENT_FAILED'
  | 'PROVISIONING_STARTED'
  | 'PROVISIONING_COMPLETE'
  | 'PROVISIONING_RETRY'
  | 'STUDENT_REGISTERED'
  | 'CONSENT_UPDATED'
  | 'OPT_IN_UPDATED'
  | 'ADMIN_USER_CREATED'
  | 'ADMIN_USER_DEACTIVATED'
  | 'SETTINGS_UPDATED'
  | 'REPORT_EXPORTED'

export interface AuditEntry {
  id: string
  action: AuditAction
  actorId: string
  actorRole: UserRole
  institutionId: string
  targetId?: string                 // uploadId, studentId, userId, etc.
  targetType?: string
  metadata?: Record<string, unknown>
  ipAddress?: string
  timestamp: string                 // ISO 8601
}

// ---------------------------------------------------------------------------
// Domain: Validation
// ---------------------------------------------------------------------------

export interface StudentRow {
  rowIndex: number
  name: string
  msisdn: string                    // Lesotho format: +26657/58/59 XXXXXXX or 57/58/59XXXXXXX
  grade?: string
  institutionId: string
}

export interface ValidationError {
  rowIndex: number
  field: string
  message: string
  code:
    | 'INVALID_MSISDN'
    | 'DUPLICATE_MSISDN'
    | 'MISSING_FIELD'
    | 'INVALID_FORMAT'
    | 'ALREADY_PROVISIONED'
}

export interface ValidationResult {
  uploadId: string
  totalRows: number
  validRows: StudentRow[]
  invalidRows: Array<StudentRow & { errors: ValidationError[] }>
  summary: {
    valid: number
    invalid: number
    duplicates: number
    alreadyProvisioned: number
  }
}

// ---------------------------------------------------------------------------
// Domain: Auth
// ---------------------------------------------------------------------------

export interface AuthUser {
  id: string
  email: string
  name: string
  role: UserRole
  institutionId: string
  token: string
  expiresAt: number                 // unix timestamp
}

export interface LoginCredentials {
  email: string
  password: string
  institutionSlug?: string
}

export interface AuthResult {
  success: boolean
  user?: AuthUser
  error?: string
}

// ---------------------------------------------------------------------------
// Domain: M-Pesa / STK Push
// ---------------------------------------------------------------------------

export interface STKPushRequest {
  payerMSISDN: string               // SPOC's phone number paying from
  merchantMSISDN: string            // Vodacom Lesotho merchant account
  amount: number
  reference: string                 // uploadId or batch reference
  description: string
}

export interface STKPushResponse {
  checkoutRequestId: string
  merchantRequestId: string
  responseCode: string
  responseDescription: string
}

export interface MpesaCallbackPayload {
  checkoutRequestId: string
  resultCode: number                // 0 = success
  resultDesc: string
  amount?: number
  mpesaReceiptNumber?: string
  transactionDate?: string
}

// ---------------------------------------------------------------------------
// Domain: Notifications
// ---------------------------------------------------------------------------

export interface Notification {
  id: string
  recipientId: string
  recipientRole: UserRole
  institutionId: string
  type:
    | 'provisioning_complete'
    | 'provisioning_partial'
    | 'payment_failed'
    | 'payment_success'
    | 'upload_ready'
    | 'system'
  title: string
  message: string
  metadata?: Record<string, unknown>
  read: boolean
  createdAt: string                 // ISO 8601
}

// ---------------------------------------------------------------------------
// Utility: Generic pagination
// ---------------------------------------------------------------------------

export interface PaginatedResult<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}
