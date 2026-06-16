/**
 * AuditService — log and query audit entries
 *
 * Requirements: 14.1–14.5
 */

import type { AuditAction, AuditEntry, PaginatedResult, UserRole } from './types'
import { AUDIT_LOG } from './mock-data/audit-log'

// In-memory store initialised with seed data
const store: AuditEntry[] = [...AUDIT_LOG]

// ---------------------------------------------------------------------------
// logAudit
// ---------------------------------------------------------------------------

export interface LogAuditContext {
  actorRole: UserRole
  institutionId: string
  targetId?: string
  targetType?: string
  metadata?: Record<string, unknown>
  ipAddress?: string
}

/**
 * Appends a new AuditEntry to the in-memory store.
 * Generates a UUID for `id` and sets `timestamp` to the current ISO string.
 * Returns the created entry.
 *
 * Requirement 14.1 — every significant system action produces an audit record.
 */
export function logAudit(
  action: AuditAction,
  actorId: string,
  context: LogAuditContext,
): AuditEntry {
  const entry: AuditEntry = {
    id: crypto.randomUUID(),
    action,
    actorId,
    actorRole: context.actorRole,
    institutionId: context.institutionId,
    ...(context.targetId !== undefined && { targetId: context.targetId }),
    ...(context.targetType !== undefined && { targetType: context.targetType }),
    ...(context.metadata !== undefined && { metadata: context.metadata }),
    ...(context.ipAddress !== undefined && { ipAddress: context.ipAddress }),
    timestamp: new Date().toISOString(),
  }

  store.push(entry)
  return entry
}

// ---------------------------------------------------------------------------
// queryAuditLog
// ---------------------------------------------------------------------------

export interface AuditQueryFilters {
  /** Filter by institution  (Req 14.3) */
  institutionId?: string
  /** Filter by actor       (Req 14.3) */
  actorId?: string
  /** Filter by action type (Req 14.3) */
  action?: AuditAction
  /** Inclusive lower bound — ISO 8601 date string (Req 14.4) */
  from?: string
  /** Inclusive upper bound — ISO 8601 date string (Req 14.4) */
  to?: string
  /** 1-based page number (default 1)  (Req 14.5) */
  page?: number
  /** Records per page (default 25)    (Req 14.5) */
  pageSize?: number
}

/**
 * Filters the audit store and returns a paginated, timestamp-descending result.
 *
 * Requirements 14.2–14.5
 */
export function queryAuditLog(filters: AuditQueryFilters): PaginatedResult<AuditEntry> {
  const page = filters.page ?? 1
  const pageSize = filters.pageSize ?? 25

  // 1. Filter
  const filtered = store.filter((entry) => {
    if (filters.institutionId && entry.institutionId !== filters.institutionId) return false
    if (filters.actorId && entry.actorId !== filters.actorId) return false
    if (filters.action && entry.action !== filters.action) return false
    if (filters.from && entry.timestamp < filters.from) return false
    if (filters.to && entry.timestamp > filters.to) return false
    return true
  })

  // 2. Sort by timestamp descending (Req 14.4)
  const sorted = [...filtered].sort((a, b) => b.timestamp.localeCompare(a.timestamp))

  // 3. Paginate (Req 14.5)
  const total = sorted.length
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const offset = (page - 1) * pageSize
  const data = sorted.slice(offset, offset + pageSize)

  return { data, total, page, pageSize, totalPages }
}
