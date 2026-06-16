/**
 * POST /api/students/register
 *
 * Public endpoint — no auth required.
 * Creates a new Student + User record in the mock store.
 *
 * Body: { name, msisdn, institutionId, password }
 *
 * Requirements: 8.1, 8.2
 */

import { NextResponse } from 'next/server'
import { STUDENTS } from '@/lib/mock-data/students'
import { USERS } from '@/lib/mock-data/users'
import { logAudit } from '@/lib/audit'
import type { Student, User } from '@/lib/types'

export async function POST(req: Request): Promise<NextResponse> {
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

  const { name, msisdn, institutionId, password } = body as Record<string, unknown>

  if (typeof name !== 'string' || !name.trim()) {
    return NextResponse.json({ error: 'Bad Request', message: 'Missing field: name' }, { status: 400 })
  }
  if (typeof msisdn !== 'string' || !msisdn.trim()) {
    return NextResponse.json({ error: 'Bad Request', message: 'Missing field: msisdn' }, { status: 400 })
  }
  if (typeof institutionId !== 'string' || !institutionId.trim()) {
    return NextResponse.json({ error: 'Bad Request', message: 'Missing field: institutionId' }, { status: 400 })
  }
  if (typeof password !== 'string' || password.length < 6) {
    return NextResponse.json({ error: 'Bad Request', message: 'Password must be at least 6 characters' }, { status: 400 })
  }

  // Check for duplicate MSISDN
  const existing = STUDENTS.find(
    (s) => s.msisdn === msisdn && s.institutionId === institutionId
  )
  if (existing) {
    return NextResponse.json(
      { error: 'Conflict', message: 'A student with this MSISDN already exists' },
      { status: 409 },
    )
  }

  const now = new Date().toISOString()
  const userId = `user-${institutionId}-student-${crypto.randomUUID().slice(0, 8)}`
  const studentId = `student-${institutionId}-${crypto.randomUUID().slice(0, 8)}`

  // Create User record
  const newUser: User = {
    id: userId,
    email: `${msisdn.replace(/\+/g, '')}@student.${institutionId}.ls`,
    passwordHash: password, // mock: plaintext
    name: name.trim(),
    role: 'student',
    institutionId,
    active: true,
    createdAt: now,
  }

  // Create Student record
  const newStudent: Student = {
    id: studentId,
    userId,
    name: name.trim(),
    msisdn,
    institutionId,
    optIn: false,
    consentGiven: false,
    status: 'pending_registration',
    registeredBy: 'self',
    registrationDate: now,
  }

  // Append to mock stores (mutate in place — mock only)
  USERS.push(newUser)
  STUDENTS.push(newStudent)

  // Audit
  logAudit('STUDENT_REGISTERED', userId, {
    actorRole: 'student',
    institutionId,
    targetId: studentId,
    targetType: 'student',
    metadata: { name, msisdn },
  })

  return NextResponse.json(
    { studentId, message: 'Registration successful' },
    { status: 200 },
  )
}
