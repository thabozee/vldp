/**
 * Middleware helpers — JWT extraction and role assertion utilities
 * for use in Next.js API route handlers.
 *
 * Requirements: 2.5, 2.9, 15.1, 15.3
 */

import { jwtVerify, type JWTPayload } from 'jose'
import type { AuthUser, UserRole } from './types'

// ---------------------------------------------------------------------------
// Constants (must match lib/auth.ts)
// ---------------------------------------------------------------------------

const JWT_SECRET = 'vldp-mock-secret-do-not-use-in-production'
const SECRET_KEY = new TextEncoder().encode(JWT_SECRET)

// ---------------------------------------------------------------------------
// Internal JWT payload shape
// ---------------------------------------------------------------------------

interface VldpJwtPayload extends JWTPayload {
  role: UserRole
  institutionId: string
  name: string
  email: string
}

// ---------------------------------------------------------------------------
// getUserFromRequest
// ---------------------------------------------------------------------------

/**
 * Extract and verify the JWT from a Request object.
 * Checks:
 *   1. `Authorization: Bearer <token>` header
 *   2. `vldp_token` cookie
 *
 * Returns an `AuthUser` (without a live token field — token is read-only here)
 * or `null` if the token is missing or invalid.
 *
 * Requirements: 2.5, 15.3
 */
export async function getUserFromRequest(req: Request): Promise<AuthUser | null> {
  let token: string | null = null

  // 1. Check Authorization header
  const authHeader = req.headers.get('authorization')
  if (authHeader && authHeader.toLowerCase().startsWith('bearer ')) {
    token = authHeader.slice(7).trim()
  }

  // 2. Fall back to cookie
  if (!token) {
    const cookieHeader = req.headers.get('cookie') ?? ''
    const match = cookieHeader
      .split(';')
      .map((c) => c.trim())
      .find((c) => c.startsWith('vldp_token='))
    if (match) {
      token = decodeURIComponent(match.slice('vldp_token='.length))
    }
  }

  if (!token) return null

  try {
    const { payload } = await jwtVerify<VldpJwtPayload>(token, SECRET_KEY)

    if (!payload.sub || !payload.role || !payload.institutionId) return null

    const authUser: AuthUser = {
      id: payload.sub,
      email: payload.email ?? '',
      name: payload.name ?? '',
      role: payload.role,
      institutionId: payload.institutionId,
      token,
      expiresAt: typeof payload.exp === 'number' ? payload.exp : 0,
    }

    return authUser
  } catch {
    return null
  }
}

// ---------------------------------------------------------------------------
// assertRole
// ---------------------------------------------------------------------------

/**
 * Verify the authenticated user's role against the required set.
 * Throws a `Response` (403 JSON) if the user does not have one of the
 * permitted roles. API route handlers can catch and return this Response.
 *
 * Usage:
 *   await assertRole(req, 'admin', 'spoc')
 *
 * Requirements: 2.9, 15.4
 */
export async function assertRole(req: Request, ...roles: UserRole[]): Promise<void> {
  const user = await getUserFromRequest(req)

  if (!user) {
    throw new Response(
      JSON.stringify({ error: 'Unauthorized', message: 'Missing or invalid token' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    )
  }

  if (!roles.includes(user.role)) {
    throw new Response(
      JSON.stringify({
        error: 'Forbidden',
        message: `Role '${user.role}' is not permitted. Required: ${roles.join(' | ')}`,
      }),
      { status: 403, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
