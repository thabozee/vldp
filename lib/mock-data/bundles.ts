/**
 * VLDP Mock Data — DataBundles
 *
 * At least three bundles per institution tier (tertiary / secondary / primary).
 * Requirements: 11.7, 9.2
 */

import type { DataBundle } from '../types'

const GB = (n: number) => n * 1_073_741_824

export const BUNDLES: DataBundle[] = [
  // ── Tertiary bundles ──────────────────────────────────────────────────────
  {
    id: 'bundle-ter-1gb',
    name: 'Tertiary Starter 1 GB',
    size: '1 GB',
    sizeBytes: GB(1),
    price: 25,
    validityDays: 30,
    description: 'Basic monthly bundle for tertiary students.',
    targetTiers: ['tertiary'],
    active: true,
  },
  {
    id: 'bundle-ter-3gb',
    name: 'Tertiary Standard 3 GB',
    size: '3 GB',
    sizeBytes: GB(3),
    price: 65,
    validityDays: 30,
    description: 'Standard monthly bundle for tertiary students.',
    targetTiers: ['tertiary'],
    active: true,
  },
  {
    id: 'bundle-ter-5gb',
    name: 'Tertiary Premium 5 GB',
    size: '5 GB',
    sizeBytes: GB(5),
    price: 99,
    validityDays: 30,
    description: 'Premium monthly bundle for tertiary students.',
    targetTiers: ['tertiary'],
    active: true,
  },
  {
    id: 'bundle-ter-10gb',
    name: 'Tertiary Unlimited 10 GB',
    size: '10 GB',
    sizeBytes: GB(10),
    price: 179,
    validityDays: 30,
    description: 'Large monthly bundle for data-intensive tertiary students.',
    targetTiers: ['tertiary'],
    active: true,
  },

  // ── Secondary bundles ─────────────────────────────────────────────────────
  {
    id: 'bundle-sec-500mb',
    name: 'Secondary Starter 500 MB',
    size: '500 MB',
    sizeBytes: GB(0.5),
    price: 15,
    validityDays: 30,
    description: 'Light monthly bundle for secondary school students.',
    targetTiers: ['secondary'],
    active: true,
  },
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
]

/** Get bundles applicable to a given institution tier */
export function getBundlesForTier(
  tier: 'tertiary' | 'secondary' | 'primary'
): DataBundle[] {
  return BUNDLES.filter((b) => b.active && b.targetTiers.includes(tier))
}
