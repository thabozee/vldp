/**
 * VLAP Mock Data — DataBundles
 *
 * At least three bundles per institution tier (tertiary / secondary / primary).
 * Requirements: 11.7, 9.2
 */

import type { DataBundle } from '../types'

const GB = (n: number) => n * 1_073_741_824

export const BUNDLES: DataBundle[] = [


  // ── Secondary bundles ─────────────────────────────────────────────────────
  {
    id: 'bundle-sec-1gb',
    name: 'Secondary Standard 1 GB',
    size: '1 GB',
    sizeBytes: GB(1),
    price: 25,
    validityDays: 30,
    description: 'Standard monthly bundle for secondary school students.',
    targetTiers: ['secondary'],
    active: true,
  },
  {
    id: 'bundle-sec-2gb',
    name: 'Secondary Premium 2 GB',
    size: '2 GB',
    sizeBytes: GB(2),
    price: 45,
    validityDays: 30,
    description: 'Premium monthly bundle for secondary school students.',
    targetTiers: ['secondary'],
    active: true,
  },

  // ── Primary bundles ───────────────────────────────────────────────────────
  {
    id: 'bundle-pri-250mb',
    name: 'Primary Starter 250 MB',
    size: '250 MB',
    sizeBytes: GB(0.25),
    price: 10,
    validityDays: 30,
    description: 'Light monthly bundle for primary school students.',
    targetTiers: ['primary'],
    active: true,
  },
  {
    id: 'bundle-pri-500mb',
    name: 'Primary Standard 500 MB',
    size: '500 MB',
    sizeBytes: GB(0.5),
    price: 18,
    validityDays: 30,
    description: 'Standard monthly bundle for primary school students.',
    targetTiers: ['primary'],
    active: true,
  },
  {
    id: 'bundle-pri-1gb',
    name: 'Primary Premium 1 GB',
    size: '1 GB',
    sizeBytes: GB(1),
    price: 30,
    validityDays: 30,
    description: 'Premium monthly bundle for primary school students.',
    targetTiers: ['primary'],
    active: true,
  },

  // ── Cross-tier bundles (available to all tiers) ───────────────────────────
  {
    id: 'bundle-all-weekly-500mb',
    name: 'All-Schools Weekly 500 MB',
    size: '500 MB',
    sizeBytes: GB(0.5),
    price: 8,
    validityDays: 7,
    description: 'Short-term weekly bundle available across all school tiers.',
    targetTiers: ['tertiary', 'secondary', 'primary'],
    active: true,
  },

  // ── SPOC Data Allocation bundles (bulk provisioning) ─────────────────────
  {
    id: 'bundle-spoc-10gb',
    name: 'Data Allocation 10 GB',
    size: '10 GB',
    sizeBytes: GB(10),
    price: 50,
    validityDays: 30,
    description: 'Vodacom Lesotho bulk data allocation — 10 GB per student.',
    targetTiers: ['tertiary', 'secondary', 'primary'],
    active: true,
  },
  {
    id: 'bundle-spoc-20gb',
    name: 'Data Allocation 20 GB',
    size: '20 GB',
    sizeBytes: GB(20),
    price: 80,
    validityDays: 30,
    description: 'Vodacom Lesotho bulk data allocation — 20 GB per student.',
    targetTiers: ['tertiary', 'secondary', 'primary'],
    active: true,
  },
  {
    id: 'bundle-spoc-40gb',
    name: 'Data Allocation 40 GB',
    size: '40 GB',
    sizeBytes: GB(40),
    price: 130,
    validityDays: 30,
    description: 'Vodacom Lesotho bulk data allocation — 40 GB per student.',
    targetTiers: ['tertiary', 'secondary', 'primary'],
    active: true,
  },
  {
    id: 'bundle-spoc-60gb',
    name: 'Data Allocation 60 GB',
    size: '60 GB',
    sizeBytes: GB(60),
    price: 199,
    validityDays: 30,
    description: 'Vodacom Lesotho bulk data allocation — 60 GB per student.',
    targetTiers: ['tertiary', 'secondary', 'primary'],
    active: true,
  },
]

/** Get bundles applicable to a given institution tier */
export function getBundlesForTier(
  tier: 'tertiary' | 'secondary' | 'primary'
): DataBundle[] {
  return BUNDLES.filter((b) => b.active && b.targetTiers.includes(tier))
}

/** Get the 4 SPOC bulk allocation bundles */
export function getSPOCAllocationBundles(): DataBundle[] {
  return BUNDLES.filter((b) => b.id.startsWith('bundle-spoc-') && b.active)
}
