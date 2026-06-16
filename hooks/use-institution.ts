'use client'

/**
 * useInstitution
 *
 * Reads the current institution branding and loading state from
 * InstitutionContext. Must be used inside an <InstitutionThemeProvider>.
 *
 * Requirements: 1.1, 1.2, 1.3
 */

import { useContext } from 'react'
import { InstitutionContext } from '@/components/institution-theme-provider'
import type { InstitutionContextValue } from '@/lib/types'

export function useInstitution(): InstitutionContextValue {
  const ctx = useContext(InstitutionContext)
  if (!ctx) {
    throw new Error('useInstitution must be used inside <InstitutionThemeProvider>')
  }
  return ctx
}
