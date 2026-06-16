/**
 * VLAP — Vodacom Lesotho Allocation Portal
 * Validation utilities — MSISDN validation, normalisation, and student list validation
 *
 * Requirements: 13.1–13.5, 3.3–3.7, 3.11, 16.1
 */

import type { StudentRow, ValidationError, ValidationResult } from './types'
import { STUDENTS } from './mock-data/students'

// ---------------------------------------------------------------------------
// Patterns
// ---------------------------------------------------------------------------

/**
 * Lesotho international format: +266 followed by any 8 digits.
 * Lesotho uses +266 country code with 8-digit subscriber numbers.
 * Common prefixes: 50-59, 62, 63, 68, 69 etc.
 * Total length: 12 characters (+266 + 8 digits).
 */
const PATTERN_INTERNATIONAL = /^\+266\d{8}$/

/**
 * Lesotho local 8-digit format: any 8 digits starting with 5 or 6.
 * Accepts all Vodacom LS, Econet, and other local number prefixes.
 */
const PATTERN_LOCAL = /^[56]\d{7}$/

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Strips whitespace, hyphens, and parentheses from a raw string.
 * Requirements: 13.4
 */
function stripSeparators(raw: string): string {
  return raw.replace(/[\s\-()]/g, '')
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Returns `true` when `msisdn` is a valid Lesotho number in either the
 * international (+26657/58/59XXXXXXX) or local (57/58/59XXXXXXX) format.
 *
 * Whitespace, hyphens, and parentheses are stripped before matching so that
 * user-entered strings such as "+266 57-123 4567" are accepted.
 *
 * Requirements: 13.1–13.4
 */
export function validateMSISDN(msisdn: string): boolean {
  if (typeof msisdn !== 'string') return false
  const cleaned = stripSeparators(msisdn.trim())
  return PATTERN_INTERNATIONAL.test(cleaned) || PATTERN_LOCAL.test(cleaned)
}

/**
 * Normalises a Lesotho MSISDN to the canonical international format
 * (+266XXXXXXXXX).
 *
 * - Strips whitespace, hyphens, and parentheses.
 * - Local 8-digit numbers (57/58/59XXXXXXX) are prefixed with +266.
 * - Already-international numbers (+26657/58/59XXXXXXX) are returned as-is.
 * - Invalid numbers are returned unchanged (callers should validate first).
 *
 * This function is **idempotent**: calling it twice on any input returns the
 * same result as calling it once — `normaliseMSISDN(normaliseMSISDN(x)) === normaliseMSISDN(x)`.
 *
 * Requirements: 13.5
 */
export function normaliseMSISDN(msisdn: string): string {
  if (typeof msisdn !== 'string') return msisdn
  const cleaned = stripSeparators(msisdn.trim())

  if (PATTERN_INTERNATIONAL.test(cleaned)) {
    // Already in canonical form — idempotent no-op.
    return cleaned
  }

  if (PATTERN_LOCAL.test(cleaned)) {
    // Convert local 8-digit → international.
    return `+266${cleaned}`
  }

  // Not a recognised Lesotho number — return the stripped string unchanged.
  return cleaned
}

// ---------------------------------------------------------------------------
// Row-level validation
// ---------------------------------------------------------------------------

/**
 * Validates a single raw CSV/XLSX row for required fields and basic format.
 *
 * Checks:
 *  - `name` field must be present and non-empty → MISSING_FIELD
 *  - `msisdn` field must be present and non-empty → MISSING_FIELD
 *
 * MSISDN format validation (INVALID_MSISDN) is performed separately by the
 * caller using `validateMSISDN` so that errors can be attributed correctly.
 *
 * Requirements: 3.4
 */
export function validateRowFormat(
  row: Record<string, string>,
  rowIndex: number,
): ValidationError[] {
  const errors: ValidationError[] = []

  if (!row['name'] || row['name'].trim() === '') {
    errors.push({
      rowIndex,
      field: 'name',
      message: 'Name is required',
      code: 'MISSING_FIELD',
    })
  }

  if (!row['msisdn'] || row['msisdn'].trim() === '') {
    errors.push({
      rowIndex,
      field: 'msisdn',
      message: 'MSISDN is required',
      code: 'MISSING_FIELD',
    })
  }

  return errors
}

// ---------------------------------------------------------------------------
// Duplicate detection
// ---------------------------------------------------------------------------

/**
 * Returns the set of normalised MSISDNs that appear more than once in `rows`.
 * Only the second and subsequent occurrences should be flagged as duplicates;
 * this function simply identifies *which* MSISDNs are duplicated so that the
 * caller can apply the DUPLICATE_MSISDN code to the correct rows.
 *
 * Requirements: 3.5
 */
export function checkDuplicates(rows: StudentRow[]): Set<string> {
  const seen = new Set<string>()
  const duplicates = new Set<string>()

  for (const row of rows) {
    const normalised = normaliseMSISDN(row.msisdn)
    if (seen.has(normalised)) {
      duplicates.add(normalised)
    } else {
      seen.add(normalised)
    }
  }

  return duplicates
}

// ---------------------------------------------------------------------------
// Sync validation core (pure, used by unit and property tests)
// ---------------------------------------------------------------------------

/**
 * Pure, synchronous validation of an in-memory array of StudentRows.
 *
 * Algorithm (per row, in order):
 *  1. Check for MISSING_FIELD errors via `validateRowFormat`.
 *  2. If msisdn is present, validate its format via `validateMSISDN`.
 *  3. Track seen MSISDNs; flag second+ occurrences as DUPLICATE_MSISDN.
 *     The first occurrence is kept in validRows; duplicates go to invalidRows.
 *  4. If `existingMsisdns` is provided, flag already-provisioned MSISDNs
 *     as ALREADY_PROVISIONED.
 *
 * Postcondition (enforced by assertion):
 *   `summary.valid + summary.invalid === totalRows`
 *
 * Requirements: 3.3–3.7
 */
export function validateStudentListSync(
  rows: StudentRow[],
  existingMsisdns?: Set<string>,
): ValidationResult {
  const uploadId = crypto.randomUUID()
  const totalRows = rows.length

  const validRows: StudentRow[] = []
  const invalidRows: Array<StudentRow & { errors: ValidationError[] }> = []

  // Track MSISDNs seen so far within this file (normalised form).
  const seenMsisdns = new Set<string>()

  // Summary counters
  let duplicatesCount = 0
  let alreadyProvisionedCount = 0

  for (const row of rows) {
    // Build a raw-row-like object so validateRowFormat can inspect fields.
    const rawRow: Record<string, string> = {
      name: row.name ?? '',
      msisdn: row.msisdn ?? '',
      ...(row.grade !== undefined ? { grade: row.grade } : {}),
    }

    const errors: ValidationError[] = validateRowFormat(rawRow, row.rowIndex)

    // Only continue with MSISDN checks if the field is present.
    if (row.msisdn && row.msisdn.trim() !== '') {
      if (!validateMSISDN(row.msisdn)) {
        errors.push({
          rowIndex: row.rowIndex,
          field: 'msisdn',
          message: `Invalid Lesotho MSISDN format: ${row.msisdn}`,
          code: 'INVALID_MSISDN',
        })
      } else {
        // MSISDN is valid format — check for intra-file duplicate.
        const normalised = normaliseMSISDN(row.msisdn)

        if (seenMsisdns.has(normalised)) {
          // Second or subsequent occurrence — flag as duplicate.
          errors.push({
            rowIndex: row.rowIndex,
            field: 'msisdn',
            message: `Duplicate MSISDN: ${row.msisdn}`,
            code: 'DUPLICATE_MSISDN',
          })
          duplicatesCount++
        } else {
          seenMsisdns.add(normalised)

          // Check against already-provisioned set.
          if (existingMsisdns && existingMsisdns.has(normalised)) {
            errors.push({
              rowIndex: row.rowIndex,
              field: 'msisdn',
              message: `MSISDN already provisioned: ${row.msisdn}`,
              code: 'ALREADY_PROVISIONED',
            })
            alreadyProvisionedCount++
          }
        }
      }
    }

    if (errors.length === 0) {
      validRows.push(row)
    } else {
      invalidRows.push({ ...row, errors })
    }
  }

  const summary = {
    valid: validRows.length,
    invalid: invalidRows.length,
    duplicates: duplicatesCount,
    alreadyProvisioned: alreadyProvisionedCount,
  }

  // Postcondition: valid + invalid must equal totalRows.
  if (summary.valid + summary.invalid !== totalRows) {
    throw new Error(
      `Validation postcondition violated: valid(${summary.valid}) + invalid(${summary.invalid}) !== totalRows(${totalRows})`,
    )
  }

  return {
    uploadId,
    totalRows,
    validRows,
    invalidRows,
    summary,
  }
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024 // 10 MB
const LARGE_FILE_ROW_THRESHOLD = 1000

// ---------------------------------------------------------------------------
// Async wrapper — used by the SPOC upload flow
// ---------------------------------------------------------------------------

/**
 * Parses a CSV or XLSX file and returns a `ValidationResult`.
 *
 * Steps:
 *  1. Validate file type (.csv / .xlsx) and size (≤ 10 MB).
 *  2. Parse the file with PapaParse (CSV) or SheetJS (XLSX).
 *  3. Map raw rows to `StudentRow` objects.
 *  4. Build the set of already-provisioned MSISDNs from the mock students store.
 *  5. Delegate to `validateStudentListSync` for the pure validation pass.
 *
 * Web Worker note:
 *  For files with > 1,000 rows the parsing should be offloaded to a Web Worker
 *  to satisfy the 3-second client-side validation budget (Requirement 16.1).
 *  The Web Worker call site is marked below with a TODO comment. For now the
 *  function runs on the main thread regardless of file size.
 *
 * Requirements: 3.1, 3.2, 3.3–3.7, 3.11, 16.1
 */
export async function validateStudentList(
  file: File,
  institutionId: string,
): Promise<ValidationResult> {
  // ── 1. File-type validation ───────────────────────────────────────────────
  const fileName = file.name.toLowerCase()
  const isCsv = fileName.endsWith('.csv')
  const isXlsx = fileName.endsWith('.xlsx')

  if (!isCsv && !isXlsx) {
    throw new Error('INVALID_FILE_FORMAT: Only .csv and .xlsx files are accepted')
  }

  // ── 2. File-size validation ───────────────────────────────────────────────
  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new Error(
      `FILE_TOO_LARGE: File size ${file.size} bytes exceeds the 10 MB limit`,
    )
  }

  // ── 3. Parse file into raw rows ───────────────────────────────────────────
  let rawRows: Record<string, string>[] = []

  if (isCsv) {
    const Papa = (await import('papaparse')).default
    const text = await file.text()
    const result = Papa.parse<Record<string, string>>(text, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (h: string) => h.trim().toLowerCase(),
    })
    rawRows = result.data
  } else {
    // XLSX
    const XLSX = await import('xlsx')
    const buffer = await file.arrayBuffer()
    const workbook = XLSX.read(buffer, { type: 'array' })
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]
    const jsonData = XLSX.utils.sheet_to_json<Record<string, unknown>>(
      worksheet,
      { defval: '' },
    )
    rawRows = jsonData.map((row) =>
      Object.fromEntries(
        Object.entries(row).map(([k, v]) => [
          k.trim().toLowerCase(),
          String(v),
        ]),
      ),
    )
  }

  // ── 4. Map raw rows to StudentRow ─────────────────────────────────────────
  const studentRows: StudentRow[] = rawRows.map((raw, index) => ({
    rowIndex: index + 1, // 1-based for human-readable error reporting
    name: (raw['name'] ?? '').trim(),
    msisdn: (raw['msisdn'] ?? '').trim(),
    grade: raw['grade'] ? raw['grade'].trim() : undefined,
    institutionId,
  }))

  // ── 5. Build already-provisioned set from mock store ─────────────────────
  const existingMsisdns = new Set(
    STUDENTS.filter((s) => s.institutionId === institutionId).map((s) =>
      normaliseMSISDN(s.msisdn),
    ),
  )

  // ── 6. TODO: Web Worker offload for large files ───────────────────────────
  // When studentRows.length > LARGE_FILE_ROW_THRESHOLD the parsing and
  // validation work should be offloaded to a Web Worker to keep the main
  // thread responsive and meet the 3-second budget defined in Requirement 16.1.
  //
  //   if (studentRows.length > LARGE_FILE_ROW_THRESHOLD) {
  //     return runValidationInWorker(studentRows, existingMsisdns)
  //   }
  //
  // For now, fall through to the synchronous implementation on all file sizes.
  void LARGE_FILE_ROW_THRESHOLD // referenced to avoid "unused variable" TS error

  // ── 7. Run pure sync validation ───────────────────────────────────────────
  return validateStudentListSync(studentRows, existingMsisdns)
}
