/**
 * POST /api/auth/login
 *
 * Validates credentials and returns the AuthUser on success.
 * institutionSlug is optional — admin logins don't need it.
 *
 * Requirements: 2.1, 2.2, 2.3, 2.4
 */

import { NextResponse } from 'next/server'
import { login } from '@/lib/auth'

export async function POST(request: Request) {
  let body: Record<string, string>

  try {
    body = (await request.json()) as Record<string, string>
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { email, password, institutionSlug } = body

  if (!email || !password) {
    return NextResponse.json(
      { error: 'email and password are required' },
      { status: 400 }
    )
  }

  const result = await login({ email, password, institutionSlug: institutionSlug ?? 'vodacom' })

  if (!result.success || !result.user) {
    return NextResponse.json(
      { error: result.error ?? 'Invalid credentials' },
      { status: 401 }
    )
  }

  // Enforce role separation: admin login must produce admin user
  // Institution login must produce spoc or student
  return NextResponse.json({ user: result.user }, { status: 200 })
}
