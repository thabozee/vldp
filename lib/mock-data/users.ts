/**
 * VLDP Mock Data — Users
 *
 * ONE global Vodacom Admin (no institution affiliation).
 * One SPOC + two Students per institution.
 *
 * ┌──────────────────────────────┬──────────────────────────────────────────────────┬──────────────┬─────────┐
 * │ Name                         │ Email                                            │ Password     │ Role    │
 * ├──────────────────────────────┼──────────────────────────────────────────────────┼──────────────┼─────────┤
 * │ Lerato Makhetha              │ lerato.makhetha@vodacom.co.ls                    │ Admin@123    │ admin   │
 * ├──────────────────────────────┼──────────────────────────────────────────────────┼──────────────┼─────────┤
 * │ NUL SPOC                     │ spoc@nul.ac.ls                                   │ Spoc@123     │ spoc    │
 * │ Thabo Molefe                 │ thabo.molefe@student.nul.ac.ls                   │ Student@123  │ student │
 * │ Palesa Mokoena               │ palesa.mokoena@student.nul.ac.ls                 │ Student@123  │ student │
 * ├──────────────────────────────┼──────────────────────────────────────────────────┼──────────────┼─────────┤
 * │ Limkokwing SPOC              │ spoc@limkokwing.ac.ls                            │ Spoc@123     │ spoc    │
 * │ Kelechi Nwosu                │ kelechi.nwosu@student.limkokwing.ac.ls           │ Student@123  │ student │
 * │ Amara Dlamini                │ amara.dlamini@student.limkokwing.ac.ls           │ Student@123  │ student │
 * ├──────────────────────────────┼──────────────────────────────────────────────────┼──────────────┼─────────┤
 * │ Botho SPOC                   │ spoc@botho.ac.bw                                 │ Spoc@123     │ spoc    │
 * │ Mpho Sithole                 │ mpho.sithole@student.botho.ac.bw                 │ Student@123  │ student │
 * │ Lerato Dube                  │ lerato.dube@student.botho.ac.bw                  │ Student@123  │ student │
 * ├──────────────────────────────┼──────────────────────────────────────────────────┼──────────────┼─────────┤
 * │ Lerotholi SPOC               │ spoc@lerotholi.ac.ls                             │ Spoc@123     │ spoc    │
 * │ Tebello Ramokoena            │ tebello.ramokoena@student.lerotholi.ac.ls        │ Student@123  │ student │
 * │ Nthabiseng Mofokeng          │ nthabiseng.mofokeng@student.lerotholi.ac.ls      │ Student@123  │ student │
 * ├──────────────────────────────┼──────────────────────────────────────────────────┼──────────────┼─────────┤
 * │ Qoaling SPOC                 │ spoc@qoaling.edu.ls                              │ Spoc@123     │ spoc    │
 * │ Lisema Fako                  │ lisema.fako@student.qoaling.edu.ls               │ Student@123  │ student │
 * │ Mamoeletsi Tau               │ mamoeletsi.tau@student.qoaling.edu.ls            │ Student@123  │ student │
 * ├──────────────────────────────┼──────────────────────────────────────────────────┼──────────────┼─────────┤
 * │ Abia SPOC                    │ spoc@abia.edu.ls                                 │ Spoc@123     │ spoc    │
 * │ Kabelo Motaung               │ kabelo.motaung@student.abia.edu.ls               │ Student@123  │ student │
 * │ Refilwe Molapo               │ refilwe.molapo@student.abia.edu.ls               │ Student@123  │ student │
 * ├──────────────────────────────┼──────────────────────────────────────────────────┼──────────────┼─────────┤
 * │ Little Darlings SPOC         │ spoc@littledarlings.edu.ls                       │ Spoc@123     │ spoc    │
 * │ Bokang Letsie                │ bokang.letsie@student.littledarlings.edu.ls      │ Student@123  │ student │
 * │ Ntsoaki Mopeli               │ ntsoaki.mopeli@student.littledarlings.edu.ls     │ Student@123  │ student │
 * ├──────────────────────────────┼──────────────────────────────────────────────────┼──────────────┼─────────┤
 * │ Tholoana SPOC                │ spoc@tholoana.edu.ls                             │ Spoc@123     │ spoc    │
 * │ Sello Mokhele                │ sello.mokhele@student.tholoana.edu.ls            │ Student@123  │ student │
 * │ Moleboheng Nthebe            │ moleboheng.nthebe@student.tholoana.edu.ls        │ Student@123  │ student │
 * └──────────────────────────────┴──────────────────────────────────────────────────┴──────────────┴─────────┘
 *
 * Requirements: 11.2, 2.1
 */

import type { User } from '../types'

// NOTE: passwords plaintext for dev mocking only. Hash with bcrypt/argon2 in production.

export const USERS: User[] = [

  // ── ONE global Vodacom Admin ───────────────────────────────────────────────
  // Not tied to any institution — can manage all.
  {
    id: 'user-vodacom-admin',
    email: 'lerato.makhetha@vodacom.co.ls',
    passwordHash: 'Admin@123',
    name: 'Lerato Makhetha',
    role: 'admin',
    institutionId: 'vodacom',   // sentinel value — not a real institution slug
    active: true,
    createdAt: '2024-01-01T08:00:00.000Z',
    lastLoginAt: '2024-12-01T09:00:00.000Z',
  },

  // ── NUL ───────────────────────────────────────────────────────────────────
  {
    id: 'user-nul-spoc',
    email: 'spoc@nul.ac.ls',
    passwordHash: 'Spoc@123',
    name: 'NUL SPOC',
    role: 'spoc',
    institutionId: 'nul',
    active: true,
    createdAt: '2024-01-15T08:00:00.000Z',
    lastLoginAt: '2024-12-01T08:30:00.000Z',
  },
  {
    id: 'user-nul-student-1',
    email: 'thabo.molefe@student.nul.ac.ls',
    passwordHash: 'Student@123',
    name: 'Thabo Molefe',
    role: 'student',
    institutionId: 'nul',
    active: true,
    createdAt: '2024-02-01T10:00:00.000Z',
  },
  {
    id: 'user-nul-student-2',
    email: 'palesa.mokoena@student.nul.ac.ls',
    passwordHash: 'Student@123',
    name: 'Palesa Mokoena',
    role: 'student',
    institutionId: 'nul',
    active: true,
    createdAt: '2024-02-01T10:00:00.000Z',
  },

  // ── Limkokwing ────────────────────────────────────────────────────────────
  {
    id: 'user-limkokwing-spoc',
    email: 'spoc@limkokwing.ac.ls',
    passwordHash: 'Spoc@123',
    name: 'Limkokwing SPOC',
    role: 'spoc',
    institutionId: 'limkokwing',
    active: true,
    createdAt: '2024-01-15T08:00:00.000Z',
    lastLoginAt: '2024-12-01T08:35:00.000Z',
  },
  {
    id: 'user-limkokwing-student-1',
    email: 'kelechi.nwosu@student.limkokwing.ac.ls',
    passwordHash: 'Student@123',
    name: 'Kelechi Nwosu',
    role: 'student',
    institutionId: 'limkokwing',
    active: true,
    createdAt: '2024-02-01T10:00:00.000Z',
  },
  {
    id: 'user-limkokwing-student-2',
    email: 'amara.dlamini@student.limkokwing.ac.ls',
    passwordHash: 'Student@123',
    name: 'Amara Dlamini',
    role: 'student',
    institutionId: 'limkokwing',
    active: true,
    createdAt: '2024-02-01T10:00:00.000Z',
  },

  // ── Botho ─────────────────────────────────────────────────────────────────
  {
    id: 'user-botho-spoc',
    email: 'spoc@botho.ac.bw',
    passwordHash: 'Spoc@123',
    name: 'Botho SPOC',
    role: 'spoc',
    institutionId: 'botho',
    active: true,
    createdAt: '2024-01-15T08:00:00.000Z',
    lastLoginAt: '2024-12-01T08:40:00.000Z',
  },
  {
    id: 'user-botho-student-1',
    email: 'mpho.sithole@student.botho.ac.bw',
    passwordHash: 'Student@123',
    name: 'Mpho Sithole',
    role: 'student',
    institutionId: 'botho',
    active: true,
    createdAt: '2024-02-01T10:00:00.000Z',
  },
  {
    id: 'user-botho-student-2',
    email: 'lerato.dube@student.botho.ac.bw',
    passwordHash: 'Student@123',
    name: 'Lerato Dube',
    role: 'student',
    institutionId: 'botho',
    active: true,
    createdAt: '2024-02-01T10:00:00.000Z',
  },

  // ── Lerotholi ─────────────────────────────────────────────────────────────
  {
    id: 'user-lerotholi-spoc',
    email: 'spoc@lerotholi.ac.ls',
    passwordHash: 'Spoc@123',
    name: 'Lerotholi SPOC',
    role: 'spoc',
    institutionId: 'lerotholi',
    active: true,
    createdAt: '2024-01-15T08:00:00.000Z',
    lastLoginAt: '2024-12-01T08:45:00.000Z',
  },
  {
    id: 'user-lerotholi-student-1',
    email: 'tebello.ramokoena@student.lerotholi.ac.ls',
    passwordHash: 'Student@123',
    name: 'Tebello Ramokoena',
    role: 'student',
    institutionId: 'lerotholi',
    active: true,
    createdAt: '2024-02-01T10:00:00.000Z',
  },
  {
    id: 'user-lerotholi-student-2',
    email: 'nthabiseng.mofokeng@student.lerotholi.ac.ls',
    passwordHash: 'Student@123',
    name: 'Nthabiseng Mofokeng',
    role: 'student',
    institutionId: 'lerotholi',
    active: true,
    createdAt: '2024-02-01T10:00:00.000Z',
  },

  // ── Qoaling ───────────────────────────────────────────────────────────────
  {
    id: 'user-qoaling-spoc',
    email: 'spoc@qoaling.edu.ls',
    passwordHash: 'Spoc@123',
    name: 'Qoaling SPOC',
    role: 'spoc',
    institutionId: 'qoaling',
    active: true,
    createdAt: '2024-01-15T08:00:00.000Z',
    lastLoginAt: '2024-12-01T08:50:00.000Z',
  },
  {
    id: 'user-qoaling-student-1',
    email: 'lisema.fako@student.qoaling.edu.ls',
    passwordHash: 'Student@123',
    name: 'Lisema Fako',
    role: 'student',
    institutionId: 'qoaling',
    active: true,
    createdAt: '2024-02-01T10:00:00.000Z',
  },
  {
    id: 'user-qoaling-student-2',
    email: 'mamoeletsi.tau@student.qoaling.edu.ls',
    passwordHash: 'Student@123',
    name: 'Mamoeletsi Tau',
    role: 'student',
    institutionId: 'qoaling',
    active: true,
    createdAt: '2024-02-01T10:00:00.000Z',
  },

  // ── Abia ──────────────────────────────────────────────────────────────────
  {
    id: 'user-abia-spoc',
    email: 'spoc@abia.edu.ls',
    passwordHash: 'Spoc@123',
    name: 'Abia SPOC',
    role: 'spoc',
    institutionId: 'abia',
    active: true,
    createdAt: '2024-01-15T08:00:00.000Z',
    lastLoginAt: '2024-12-01T08:55:00.000Z',
  },
  {
    id: 'user-abia-student-1',
    email: 'kabelo.motaung@student.abia.edu.ls',
    passwordHash: 'Student@123',
    name: 'Kabelo Motaung',
    role: 'student',
    institutionId: 'abia',
    active: true,
    createdAt: '2024-02-01T10:00:00.000Z',
  },
  {
    id: 'user-abia-student-2',
    email: 'refilwe.molapo@student.abia.edu.ls',
    passwordHash: 'Student@123',
    name: 'Refilwe Molapo',
    role: 'student',
    institutionId: 'abia',
    active: true,
    createdAt: '2024-02-01T10:00:00.000Z',
  },

  // ── Little Darlings ───────────────────────────────────────────────────────
  {
    id: 'user-little-darlings-spoc',
    email: 'spoc@littledarlings.edu.ls',
    passwordHash: 'Spoc@123',
    name: 'Little Darlings SPOC',
    role: 'spoc',
    institutionId: 'little-darlings',
    active: true,
    createdAt: '2024-01-15T08:00:00.000Z',
    lastLoginAt: '2024-12-01T09:00:00.000Z',
  },
  {
    id: 'user-little-darlings-student-1',
    email: 'bokang.letsie@student.littledarlings.edu.ls',
    passwordHash: 'Student@123',
    name: 'Bokang Letsie',
    role: 'student',
    institutionId: 'little-darlings',
    active: true,
    createdAt: '2024-02-01T10:00:00.000Z',
  },
  {
    id: 'user-little-darlings-student-2',
    email: 'ntsoaki.mopeli@student.littledarlings.edu.ls',
    passwordHash: 'Student@123',
    name: 'Ntsoaki Mopeli',
    role: 'student',
    institutionId: 'little-darlings',
    active: true,
    createdAt: '2024-02-01T10:00:00.000Z',
  },

  // ── Tholoana ──────────────────────────────────────────────────────────────
  {
    id: 'user-tholoana-spoc',
    email: 'spoc@tholoana.edu.ls',
    passwordHash: 'Spoc@123',
    name: 'Tholoana SPOC',
    role: 'spoc',
    institutionId: 'tholoana',
    active: true,
    createdAt: '2024-01-15T08:00:00.000Z',
    lastLoginAt: '2024-12-01T09:05:00.000Z',
  },
  {
    id: 'user-tholoana-student-1',
    email: 'sello.mokhele@student.tholoana.edu.ls',
    passwordHash: 'Student@123',
    name: 'Sello Mokhele',
    role: 'student',
    institutionId: 'tholoana',
    active: true,
    createdAt: '2024-02-01T10:00:00.000Z',
  },
  {
    id: 'user-tholoana-student-2',
    email: 'moleboheng.nthebe@student.tholoana.edu.ls',
    passwordHash: 'Student@123',
    name: 'Moleboheng Nthebe',
    role: 'student',
    institutionId: 'tholoana',
    active: true,
    createdAt: '2024-02-01T10:00:00.000Z',
  },
]

/**
 * Look up a User by email.
 * Admin is looked up without institutionId constraint.
 * SPOC/Student must match institutionId too.
 */
export function findUserByEmail(
  email: string,
  institutionId?: string,
): User | undefined {
  const lc = email.toLowerCase()
  return USERS.find((u) => {
    if (u.email.toLowerCase() !== lc) return false
    // Admin has no institution constraint
    if (u.role === 'admin') return true
    return !institutionId || u.institutionId === institutionId
  })
}

/** Get all users belonging to an institution */
export function getUsersByInstitution(institutionId: string): User[] {
  return USERS.filter((u) => u.institutionId === institutionId)
}

/** Get all SPOC users */
export function getSPOCUsers(): User[] {
  return USERS.filter((u) => u.role === 'spoc')
}

/** Get the single Vodacom admin */
export function getAdminUser(): User | undefined {
  return USERS.find((u) => u.role === 'admin')
}
