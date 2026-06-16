/**
 * POST /api/students/opt-in
 *
 * Requires student auth.
 * Body: { studentId, optIn: boolean }
 *
 * Requirements: 8.4
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
      { error: 'Forbidden', message: 'Only students can update opt-in status' },
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

  const { studentId, optIn } = body as Record<string, unknown>

  if (typeof studentId !== 'string' || !studentId.trim()) {
    return NextResponse.json({ error: 'Bad Request', message: 'Missing field: studentId' }, { status: 400 })
  }

  if (typeof optIn !== 'boolean') {
    return NextResponse.json({ error: 'Bad Request', message: 'Field optIn must be boolean' }, { status: 400 })
  }

  const student = STUDENTS.find((s) => s.userId === user.id)

  if (!student) {
    return NextResponse.json(
      { error: 'Not Found', message: 'Student record not found' },
      { status: 404 },
    )
  }

  student.optIn = optIn

  logAudit('OPT_IN_UPDATED', user.id, {
    actorRole: 'student',
    institutionId: user.institutionId,
    targetId: student.id,
    targetType: 'student',
    metadata: { optIn },
  })

  return NextResponse.json({ message: 'Opt-in status updated' }, { status: 200 })
}
