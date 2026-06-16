/**
 * VLAP Mock Data — Students
 *
 * Two Student records per institution, linked to their User records.
 * Consent and optIn states intentionally varied to exercise all code paths.
 *
 * Requirements: 11.2, 8.1–8.6
 */

import type { Student } from '../types'

export const STUDENTS: Student[] = [
  // ── NUL ───────────────────────────────────────────────────────────────────
  {
    id: 'student-nul-1',
    userId: 'user-nul-student-1',
    name: 'Thabo Molefe',
    msisdn: '+26657210001',
    institutionId: 'nul',
    grade: 'Year 3',
    optIn: true,
    consentGiven: true,
    consentDate: '2024-02-05T10:00:00.000Z',
    status: 'active',
    registeredBy: 'self',
    registrationDate: '2024-02-01T10:00:00.000Z',
    currentBundleId: 'bundle-ter-5gb',
    dataBalance: '3.2 GB remaining',
  },
  {
    id: 'student-nul-2',
    userId: 'user-nul-student-2',
    name: 'Palesa Mokoena',
    msisdn: '+26657210002',
    institutionId: 'nul',
    grade: 'Year 1',
    optIn: false,
    consentGiven: false,
    status: 'pending_registration',
    registeredBy: 'self',
    registrationDate: '2024-02-01T11:00:00.000Z',
  },

  // ── Limkokwing ────────────────────────────────────────────────────────────
  {
    id: 'student-limkokwing-1',
    userId: 'user-limkokwing-student-1',
    name: 'Kelechi Nwosu',
    msisdn: '+26658210001',
    institutionId: 'limkokwing',
    grade: 'Year 2',
    optIn: true,
    consentGiven: true,
    consentDate: '2024-02-06T10:00:00.000Z',
    status: 'active',
    registeredBy: 'spoc',
    registrationDate: '2024-02-01T10:00:00.000Z',
    currentBundleId: 'bundle-ter-3gb',
    dataBalance: '1.8 GB remaining',
  },
  {
    id: 'student-limkokwing-2',
    userId: 'user-limkokwing-student-2',
    name: 'Amara Dlamini',
    msisdn: '+26658210002',
    institutionId: 'limkokwing',
    grade: 'Year 4',
    optIn: true,
    consentGiven: false,
    status: 'pending_registration',
    registeredBy: 'self',
    registrationDate: '2024-02-02T10:00:00.000Z',
  },

  // ── Botho ─────────────────────────────────────────────────────────────────
  {
    id: 'student-botho-1',
    userId: 'user-botho-student-1',
    name: 'Mpho Sithole',
    msisdn: '+26657210003',
    institutionId: 'botho',
    grade: 'Year 2',
    optIn: true,
    consentGiven: true,
    consentDate: '2024-02-07T09:00:00.000Z',
    status: 'active',
    registeredBy: 'admin',
    registrationDate: '2024-02-01T10:00:00.000Z',
    currentBundleId: 'bundle-ter-3gb',
    dataBalance: '2.5 GB remaining',
  },
  {
    id: 'student-botho-2',
    userId: 'user-botho-student-2',
    name: 'Lerato Dube',
    msisdn: '+26657210004',
    institutionId: 'botho',
    grade: 'Year 3',
    optIn: false,
    consentGiven: true,
    consentDate: '2024-02-08T09:00:00.000Z',
    status: 'active',
    registeredBy: 'self',
    registrationDate: '2024-02-02T10:00:00.000Z',
    currentBundleId: 'bundle-ter-1gb',
    dataBalance: '512 MB remaining',
  },

  // ── Lerotholi ─────────────────────────────────────────────────────────────
  {
    id: 'student-lerotholi-1',
    userId: 'user-lerotholi-student-1',
    name: 'Tebello Ramokoena',
    msisdn: '+26658210003',
    institutionId: 'lerotholi',
    grade: 'HND2',
    optIn: true,
    consentGiven: true,
    consentDate: '2024-02-09T08:00:00.000Z',
    status: 'active',
    registeredBy: 'spoc',
    registrationDate: '2024-02-01T10:00:00.000Z',
    currentBundleId: 'bundle-ter-5gb',
    dataBalance: '4.1 GB remaining',
  },
  {
    id: 'student-lerotholi-2',
    userId: 'user-lerotholi-student-2',
    name: 'Nthabiseng Mofokeng',
    msisdn: '+26658210004',
    institutionId: 'lerotholi',
    grade: 'HND1',
    optIn: false,
    consentGiven: false,
    status: 'suspended',
    registeredBy: 'self',
    registrationDate: '2024-02-02T10:00:00.000Z',
  },

  // ── Qoaling ───────────────────────────────────────────────────────────────
  {
    id: 'student-qoaling-1',
    userId: 'user-qoaling-student-1',
    name: 'Lisema Fako',
    msisdn: '+26659210001',
    institutionId: 'qoaling',
    grade: 'Form D',
    optIn: true,
    consentGiven: true,
    consentDate: '2024-02-10T08:00:00.000Z',
    status: 'active',
    registeredBy: 'spoc',
    registrationDate: '2024-02-01T10:00:00.000Z',
    currentBundleId: 'bundle-sec-1gb',
    dataBalance: '650 MB remaining',
  },
  {
    id: 'student-qoaling-2',
    userId: 'user-qoaling-student-2',
    name: 'Mamoeletsi Tau',
    msisdn: '+26659210002',
    institutionId: 'qoaling',
    grade: 'Form C',
    optIn: true,
    consentGiven: false,
    status: 'pending_registration',
    registeredBy: 'self',
    registrationDate: '2024-02-03T10:00:00.000Z',
  },

  // ── Abia ──────────────────────────────────────────────────────────────────
  {
    id: 'student-abia-1',
    userId: 'user-abia-student-1',
    name: 'Kabelo Motaung',
    msisdn: '+26657210005',
    institutionId: 'abia',
    grade: 'Form D',
    optIn: true,
    consentGiven: true,
    consentDate: '2024-02-11T08:00:00.000Z',
    status: 'active',
    registeredBy: 'spoc',
    registrationDate: '2024-02-01T10:00:00.000Z',
    currentBundleId: 'bundle-sec-2gb',
    dataBalance: '1.2 GB remaining',
  },
  {
    id: 'student-abia-2',
    userId: 'user-abia-student-2',
    name: 'Refilwe Molapo',
    msisdn: '+26657210006',
    institutionId: 'abia',
    grade: 'Form E',
    optIn: false,
    consentGiven: true,
    consentDate: '2024-02-12T08:00:00.000Z',
    status: 'active',
    registeredBy: 'self',
    registrationDate: '2024-02-02T10:00:00.000Z',
    currentBundleId: 'bundle-sec-500mb',
    dataBalance: '200 MB remaining',
  },

  // ── Little Darlings ───────────────────────────────────────────────────────
  {
    id: 'student-little-darlings-1',
    userId: 'user-little-darlings-student-1',
    name: 'Bokang Letsie',
    msisdn: '+26658210005',
    institutionId: 'little-darlings',
    grade: 'Grade 6',
    optIn: true,
    consentGiven: true,
    consentDate: '2024-02-13T08:00:00.000Z',
    status: 'active',
    registeredBy: 'admin',
    registrationDate: '2024-02-01T10:00:00.000Z',
    currentBundleId: 'bundle-pri-500mb',
    dataBalance: '320 MB remaining',
  },
  {
    id: 'student-little-darlings-2',
    userId: 'user-little-darlings-student-2',
    name: 'Ntsoaki Mopeli',
    msisdn: '+26658210006',
    institutionId: 'little-darlings',
    grade: 'Grade 5',
    optIn: false,
    consentGiven: false,
    status: 'pending_registration',
    registeredBy: 'self',
    registrationDate: '2024-02-03T10:00:00.000Z',
  },

  // ── Tholoana ──────────────────────────────────────────────────────────────
  {
    id: 'student-tholoana-1',
    userId: 'user-tholoana-student-1',
    name: 'Sello Mokhele',
    msisdn: '+26659210003',
    institutionId: 'tholoana',
    grade: 'Grade 7',
    optIn: true,
    consentGiven: true,
    consentDate: '2024-02-14T08:00:00.000Z',
    status: 'active',
    registeredBy: 'admin',
    registrationDate: '2024-02-01T10:00:00.000Z',
    currentBundleId: 'bundle-pri-1gb',
    dataBalance: '780 MB remaining',
  },
  {
    id: 'student-tholoana-2',
    userId: 'user-tholoana-student-2',
    name: 'Moleboheng Nthebe',
    msisdn: '+26659210004',
    institutionId: 'tholoana',
    grade: 'Grade 6',
    optIn: true,
    consentGiven: false,
    status: 'pending_registration',
    registeredBy: 'self',
    registrationDate: '2024-02-02T10:00:00.000Z',
  },
]

/** Get students for an institution */
export function getStudentsByInstitution(institutionId: string): Student[] {
  return STUDENTS.filter((s) => s.institutionId === institutionId)
}

/** Find student by userId */
export function getStudentByUserId(userId: string): Student | undefined {
  return STUDENTS.find((s) => s.userId === userId)
}

/** Find student by MSISDN */
export function getStudentByMsisdn(msisdn: string): Student | undefined {
  return STUDENTS.find((s) => s.msisdn === msisdn)
}
