/**
 * POST /api/students/consent
 *
 * Requires student auth.
 * Body: { studentId, consentGiven: boolean }
 *
 * Requirements: 8.3
 */

import { NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/middleware-helpers'
import { STUDENTS } from '@/lib/mock-data/students'
import { logAudit } from '@/lib/audit'

export async function POST(req: Request): Promise<NextResponse> {
  const user = await getUserFromRequest(req)

  if (!user) {
    return NextResponse.json(
      { error: 'Unauthorized', message: 'Missing or invalid token' },
      { status: 401 },
    )
  }

  if (user.role !== 'student') {
    return NextResponse.json(
      { error: 'Forbidden', message: 'Only students can update consent' },
      { status: 403 },
    )
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json(
      { error: 'Bad Request', message: 'Request body must be valid JSON' },
      { status: 400 },
    )
  }

  if (!body || typeof body !== 'object') {
    return NextResponse.json(
      { error: 'Bad Request', message: 'Request body must be a JSON object' },
      { status: 400 },
    )
  }

  const { studentId, consentGiven } = body as Record<string, unknown>

  if (typeof studentId !== 'string' || !studentId.trim()) {
    return NextResponse.json({ error: 'Bad Request', message: 'Missing field: studentId' }, { status: 400 })
  }

  if (typeof consentGiven !== 'boolean') {
    return NextResponse.json({ error: 'Bad Request', message: 'Field consentGiven must be boolean' }, { status: 400 })
  }

  const student = STUDENTS.find((s) => s.userId === user.id)

  if (!student) {
    return NextResponse.json(
      { error: 'Not Found', message: 'Student record not found' },
      { status: 404 },
    )
  }

  student.consentGiven = consentGiven
  if (consentGiven) {
    student.consentDate = new Date().toISOString()
  }

  logAudit('CONSENT_UPDATED', user.id, {
    actorRole: 'student',
    institutionId: user.institutionId,
    targetId: student.id,
    targetType: 'student',
    metadata: { consentGiven },
  })

  return NextResponse.json({ message: 'Consent updated' }, { status: 200 })
}
