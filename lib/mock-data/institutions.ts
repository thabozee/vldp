/**
 * VLAP Mock Data — Institutions
 * Eight supported educational institutions at launch.
 *
 * Requirements: 11.1, 1.1
 */

import type { Institution, InstitutionBranding } from '../types'

// Shared Vodacom Lesotho merchant MSISDN (all provisioning payments land here)
const VODACOM_MERCHANT = '+26657000001'

export const INSTITUTIONS: Institution[] = [
  // ── Tertiary ──────────────────────────────────────────────────────────────
  {
    id: 'nul',
    slug: 'national-university-of-lesotho',
    name: 'National University of Lesotho',
    shortName: 'NUL',
    type: 'tertiary',
    primaryColor: '#003087',
    logoUrl: '/logos/nul.png',
    faviconUrl: '/logos/nul-favicon.ico',
    merchantMSISDN: '+26657100001',
    vodacomMerchantMSISDN: VODACOM_MERCHANT,
    active: true,
    createdAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'limkokwing',
    slug: 'limkokwing-university',
    name: 'Limkokwing University',
    shortName: 'LU',
    type: 'tertiary',
    primaryColor: '#CC0000',
    logoUrl: '/logos/limkokwing.png',
    faviconUrl: '/logos/limkokwing-favicon.ico',
    merchantMSISDN: '+26657100002',
    vodacomMerchantMSISDN: VODACOM_MERCHANT,
    active: true,
    createdAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'botho',
    slug: 'botho-university',
    name: 'Botho University',
    shortName: 'BU',
    type: 'tertiary',
    primaryColor: '#005B99',
    logoUrl: '/logos/botho.png',
    faviconUrl: '/logos/botho-favicon.ico',
    merchantMSISDN: '+26657100003',
    vodacomMerchantMSISDN: VODACOM_MERCHANT,
    active: true,
    createdAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'lerotholi',
    slug: 'lerotholi-polytechnic',
    name: 'Lerotholi Polytechnic',
    shortName: 'LP',
    type: 'tertiary',
    primaryColor: '#006633',
    logoUrl: '/logos/lerotholi.png',
    faviconUrl: '/logos/lerotholi-favicon.ico',
    merchantMSISDN: '+26657100004',
    vodacomMerchantMSISDN: VODACOM_MERCHANT,
    active: true,
    createdAt: '2024-01-01T00:00:00.000Z',
  },
  // ── Secondary ─────────────────────────────────────────────────────────────
  {
    id: 'qoaling',
    slug: 'qoaling-high-school',
    name: 'Qoaling High School',
    shortName: 'QHS',
    type: 'secondary',
    primaryColor: '#8B0000',
    logoUrl: '/logos/qoaling.png',
    faviconUrl: '/logos/qoaling-favicon.ico',
    merchantMSISDN: '+26657100005',
    vodacomMerchantMSISDN: VODACOM_MERCHANT,
    active: true,
    createdAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'abia',
    slug: 'abia-high-school',
    name: 'Abia High School',
    shortName: 'AHS',
    type: 'secondary',
    primaryColor: '#4B0082',
    logoUrl: '/logos/abia.png',
    faviconUrl: '/logos/abia-favicon.ico',
    merchantMSISDN: '+26657100006',
    vodacomMerchantMSISDN: VODACOM_MERCHANT,
    active: true,
    createdAt: '2024-01-01T00:00:00.000Z',
  },
  // ── Primary ───────────────────────────────────────────────────────────────
  {
    id: 'little-darlings',
    slug: 'little-darlings',
    name: 'Little Darlings',
    shortName: 'LD',
    type: 'primary',
    primaryColor: '#FF6B00',
    logoUrl: '/logos/little-darlings.png',
    faviconUrl: '/logos/little-darlings-favicon.ico',
    merchantMSISDN: '+26657100007',
    vodacomMerchantMSISDN: VODACOM_MERCHANT,
    active: true,
    createdAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'tholoana',
    slug: 'tholoana-ea-bopheho',
    name: 'Tholoana ea Bopheho',
    shortName: 'TEB',
    type: 'primary',
    primaryColor: '#228B22',
    logoUrl: '/logos/tholoana.png',
    faviconUrl: '/logos/tholoana-favicon.ico',
    merchantMSISDN: '+26657100008',
    vodacomMerchantMSISDN: VODACOM_MERCHANT,
    active: true,
    createdAt: '2024-01-01T00:00:00.000Z',
  },
]

/** Look up a full Institution by slug */
export function getInstitutionBySlug(slug: string): Institution | undefined {
  return INSTITUTIONS.find((i) => i.slug === slug)
}

/** Look up a full Institution by id */
export function getInstitutionById(id: string): Institution | undefined {
  return INSTITUTIONS.find((i) => i.id === id)
}

/** Branding-only view, consumed by InstitutionThemeProvider */
export const INSTITUTION_BRANDINGS: InstitutionBranding[] = INSTITUTIONS.map(
  ({ id, slug, name, shortName, type, primaryColor, logoUrl, faviconUrl }) => ({
    id,
    slug,
    name,
    shortName,
    type,
    primaryColor,
    logoUrl,
    faviconUrl,
  })
)
