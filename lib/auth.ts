/**
 * AuthService — authentication and session management
 *
 * Requirements: 2.1–2.9, 15.1
 *
 * Uses `jose` (v6+) for JWT sign/verify.
 * Sessions are tracked in an in-memory Map keyed by token string.
 * This is intentionally mock-grade — do NOT use in production.
 */

import { SignJWT, jwtVerify, type JWTPayload } from 'jose'
import type { AuthResult, AuthUser, LoginCredentials, UserRole } from './types'
import { USERS } from './mock-data/users'
import { getInstitutionBySlug } from './mock-data/institutions'
import { logAudit } from './audit'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

// Static mock secret — development only, never use in production.
const JWT_SECRET = 'vldp-mock-secret-do-not-use-in-production'
const SECRET_KEY = new TextEncoder().encode(JWT_SECRET)

/** Token validity window (8 hours in seconds) */
const TOKEN_EXPIRY_SECONDS = 8 * 60 * 60

// ---------------------------------------------------------------------------
// In-memory session store  (token → AuthUser)
// ---------------------------------------------------------------------------

const sessions = new Map<string, AuthUser>()

// ---------------------------------------------------------------------------
// JWT helpers
// ---------------------------------------------------------------------------

interface VldpJwtPayload extends JWTPayload {
  role: UserRole
  institutionId: string
  name: string
  email: string
}

async function signToken(user: Omit<AuthUser, 'token' | 'expiresAt'>): Promise<{ token: string; expiresAt: number }> {
  const now = Math.floor(Date.now() / 1000)
  const expiresAt = now + TOKEN_EXPIRY_SECONDS

  const token = await new SignJWT({
    sub: user.id,
    role: user.role,
    institutionId: user.institutionId,
    name: user.name,
    email: user.email,
  } satisfies Omit<VldpJwtPayload, keyof JWTPayload>)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt(now)
    .setExpirationTime(expiresAt)
    .sign(SECRET_KEY)

  return { token, expiresAt }
}

async function verifyToken(token: string): Promise<VldpJwtPayload | null> {
  try {
    const { payload } = await jwtVerify<VldpJwtPayload>(token, SECRET_KEY)
    return payload
  } catch {
    return null
  }
}

// ---------------------------------------------------------------------------
// login
// ---------------------------------------------------------------------------

/**
 * Validate credentials, issue a JWT, store the session, and return an AuthUser.
 *
 * Requirements 2.1, 2.2, 2.3, 2.4
 */
export async function login(credentials: LoginCredentials): Promise<AuthResult> {
  const { email, password, institutionSlug } = credentials

  // Admin login: no institution slug required — match by email only
  const isAdminLogin = !institutionSlug || institutionSlug === 'vodacom'
  
  let user
  if (isAdminLogin) {
    // Look up admin by email only
    const { findUserByEmail } = await import('./mock-data/users')
    user = findUserByEmail(email)
    if (user && user.role !== 'admin') user = undefined
  } else {
    // SPOC / Student: must match institution
    const institution = getInstitutionBySlug(institutionSlug)
    if (!institution) return { success: false, error: 'Invalid credentials' }
    const { findUserByEmail } = await import('./mock-data/users')
    user = findUserByEmail(email, institution.id)
  }
  if (!user) {
    return { success: false, error: 'Invalid credentials' }
  }

  // Validate password (mock: plaintext comparison)
  if (user.passwordHash !== password) {
    return { success: false, error: 'Invalid credentials' }
  }

  // Ensure the account is active (Req 2.3)
  if (!user.active) {
    return { success: false, error: 'Invalid credentials' }
  }

  // Issue JWT
  const { token, expiresAt } = await signToken({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    institutionId: user.institutionId,
  })

  const authUser: AuthUser = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    institutionId: user.institutionId,
    token,
    expiresAt,
  }

  // Store session
  sessions.set(token, authUser)

  // Update lastLoginAt on the underlying mock user record (mock only)
  const userRecord = USERS.find((u) => u.id === user.id)
  if (userRecord) {
    userRecord.lastLoginAt = new Date().toISOString()
  }

  // Audit: LOGIN  (Req 15.1)
  logAudit('LOGIN', user.id, {
    actorRole: user.role,
    institutionId: user.institutionId,
    metadata: { email: user.email },
  })

  return { success: true, user: authUser }
}

// ---------------------------------------------------------------------------
// logout
// ---------------------------------------------------------------------------

/**
 * Invalidate the session for the given userId.
 * Removes all session entries belonging to that user.
 *
 * Requirements 2.6
 */
export function logout(userId: string): void {
  // Find and remove all tokens belonging to this user
  for (const [token, authUser] of sessions.entries()) {
    if (authUser.id === userId) {
      sessions.delete(token)

      // Audit: LOGOUT  (Req 15.1)
      logAudit('LOGOUT', userId, {
        actorRole: authUser.role,
        institutionId: authUser.institutionId,
      })
    }
  }
}

// ---------------------------------------------------------------------------
// getCurrentUser
// ---------------------------------------------------------------------------

/**
 * Decode and validate a JWT token. Returns the AuthUser if valid and
 * the session is still active, or null if expired/invalid.
 *
 * Requirements 2.5, 2.7
 */
export async function getCurrentUser(token: string): Promise<AuthUser | null> {
  // Check in-memory session first (fast path)
  const cached = sessions.get(token)
  if (!cached) return null

  // Verify the JWT signature and expiry
  const payload = await verifyToken(token)
  if (!payload || !payload.sub) {
    // Token tampered or expired — clean up session
    sessions.delete(token)
    return null
  }

  return cached
}

// ---------------------------------------------------------------------------
// refreshSession
// ---------------------------------------------------------------------------

/**
 * Extend the expiry of an active, valid session by re-issuing the token.
 * The old token is removed from the session store; the new token replaces it.
 * Returns true if the session was refreshed, false otherwise.
 *
 * Requirements 2.8
 */
export async function refreshSession(token: string): Promise<boolean> {
  const existing = sessions.get(token)
  if (!existing) return false

  // Verify the current token is still valid (not expired/tampered)
  const payload = await verifyToken(token)
  if (!payload || !payload.sub) {
    sessions.delete(token)
    return false
  }

  // Issue a fresh token
  const { token: newToken, expiresAt } = await signToken({
    id: existing.id,
    email: existing.email,
    name: existing.name,
    role: existing.role,
    institutionId: existing.institutionId,
  })

  const refreshedUser: AuthUser = { ...existing, token: newToken, expiresAt }

  // Swap session entries
  sessions.delete(token)
  sessions.set(newToken, refreshedUser)

  return true
}

// ---------------------------------------------------------------------------
// hasRole
// ---------------------------------------------------------------------------

/**
 * Return true if the authenticated user has the specified role.
 *
 * Requirement 2.9
 */
export function hasRole(user: AuthUser, role: UserRole): boolean {
  return user.role === role
}

// ---------------------------------------------------------------------------
// requireRole
// ---------------------------------------------------------------------------

/**
 * Curried role-check — returns a predicate that accepts an AuthUser.
 *
 * Requirement 2.9
 *
 * Usage:
 *   const isAdmin = requireRole('admin')
 *   if (!isAdmin(currentUser)) throw new Error('Forbidden')
 */
export function requireRole(role: UserRole): (user: AuthUser) => boolean {
  return (user: AuthUser) => hasRole(user, role)
}
