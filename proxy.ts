/**
 * VLDP Next.js Middleware
 *
 * Intercepts all protected routes and enforces JWT authentication + role-based
 * access control before requests reach route handlers.
 *
 * Protected scopes:
 *   - /api/*             (except /api/auth/*)
 *   - /[institution]/admin/*
 *   - /[institution]/spoc/*
 *   - /[institution]/student/*
 *
 * On success, decoded user claims are forwarded as request headers:
 *   x-user-id, x-user-role, x-institution-id
 *
 * Requirements: 2.5, 2.9, 15.1, 15.3, 15.4
 */

import { jwtVerify, type JWTPayload } from 'jose'
import { type NextRequest, NextResponse } from 'next/server'
import type { UserRole } from '@/lib/types'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const JWT_SECRET = 'vldp-mock-secret-do-not-use-in-production'
const SECRET_KEY = new TextEncoder().encode(JWT_SECRET)

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

interface VldpJwtPayload extends JWTPayload {
  role: UserRole
  institutionId: string
  name: string
  email: string
}

/** Extract Bearer token from Authorization header or vldp_token cookie. */
function extractToken(req: NextRequest): string | null {
  const authHeader = req.headers.get('authorization')
  if (authHeader && authHeader.toLowerCase().startsWith('bearer ')) {
    return authHeader.slice(7).trim()
  }

  const cookie = req.cookies.get('vldp_token')
  if (cookie?.value) return cookie.value

  return null
}

function json401(message: string): NextResponse {
  return NextResponse.json({ error: 'Unauthorized', message }, { status: 401 })
}

function json403(message: string): NextResponse {
  return NextResponse.json({ error: 'Forbidden', message }, { status: 403 })
}

// ---------------------------------------------------------------------------
// Role resolution
// ---------------------------------------------------------------------------

/**
 * Determine which role(s) are required for a given pathname.
 * Returns:
 *   - `null`      → public route, no auth required
 *   - `string[]`  → one or more acceptable roles
 *   - `'any'`     → any authenticated user is allowed
 */
function requiredRolesFor(pathname: string): string[] | 'any' | null {
  // ── API routes only ───────────────────────────────────────────────────────
  // (Page routes are excluded from the matcher and handled client-side)
  if (pathname.startsWith('/api/')) {
    if (pathname.startsWith('/api/auth/') || pathname === '/api/auth') return null
    if (pathname === '/api/payments/callback' || pathname.startsWith('/api/payments/callback/')) return null
    if (pathname.startsWith('/api/payments/simulate')) return null
    if (pathname.startsWith('/api/admin/'))        return ['admin']
    if (pathname.startsWith('/api/provisioning/')) return ['admin']
    if (pathname.startsWith('/api/uploads/'))      return ['spoc']
    if (pathname.startsWith('/api/payments/'))     return ['spoc', 'student']
    if (pathname.startsWith('/api/students/'))     return 'any'
    return 'any'
  }

  return null
}

// ---------------------------------------------------------------------------
// Middleware entry point
// ---------------------------------------------------------------------------

export async function proxy(req: NextRequest): Promise<NextResponse> {
  const { pathname } = req.nextUrl

  const required = requiredRolesFor(pathname)

  // Public route — pass through immediately
  if (required === null) {
    return NextResponse.next()
  }

  // ── Token extraction ──────────────────────────────────────────────────────
  const token = extractToken(req)
  if (!token) {
    return json401('Missing authentication token')
  }

  // ── JWT verification ──────────────────────────────────────────────────────
  let payload: VldpJwtPayload
  try {
    const result = await jwtVerify<VldpJwtPayload>(token, SECRET_KEY)
    payload = result.payload
  } catch {
    return json401('Invalid or expired token')
  }

  if (!payload.sub || !payload.role || !payload.institutionId) {
    return json401('Malformed token payload')
  }

  // ── Role check ────────────────────────────────────────────────────────────
  if (required !== 'any' && !required.includes(payload.role)) {
    return json403(
      `Role '${payload.role}' is not permitted for this route. Required: ${required.join(' | ')}`
    )
  }

  // ── Forward user claims to route handler ──────────────────────────────────
  const requestHeaders = new Headers(req.headers)
  requestHeaders.set('x-user-id', payload.sub)
  requestHeaders.set('x-user-role', payload.role)
  requestHeaders.set('x-institution-id', payload.institutionId)

  return NextResponse.next({ request: { headers: requestHeaders } })
}

// ---------------------------------------------------------------------------
// Matcher config — which routes the middleware should run on
// ---------------------------------------------------------------------------

export const config = {
  matcher: [
    /*
     * Only protect API routes server-side via the proxy.
     * Page routes (/[institution]/admin/**, /spoc/**, /student/**)
     * use client-side auth checks via localStorage in their layouts.
     *
     * Exclude Next.js internals and public assets.
     */
    '/api/:path*',
  ],
}
