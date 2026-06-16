"use client"

import { useState, useEffect, useCallback } from "react"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type Language = "en" | "st"

// ---------------------------------------------------------------------------
// String maps
// ---------------------------------------------------------------------------

export const translations: Record<Language, Record<string, string>> = {
  en: {
    "nav.dashboard": "Dashboard",
    "nav.upload": "Upload",
    "nav.history": "History",
    "nav.profile": "Profile",
    "nav.allocations": "Allocations",
    "nav.buyData": "Buy Data",
    "nav.transactions": "Transactions",
    "nav.support": "Support",
    "auth.signIn": "Sign in",
    "auth.signOut": "Sign out",
    "auth.email": "Email address",
    "auth.password": "Password",
    "auth.forgotPassword": "Forgot password?",
    "upload.dropzone": "Drop CSV or XLSX here, or click to browse",
    "upload.validate": "Validate File",
    "upload.proceedToPay": "Proceed to Pay",
    "upload.cancel": "Cancel",
    "upload.validRows": "Valid Rows",
    "upload.invalidRows": "Invalid Rows",
    "payment.pay": "Pay via M-Pesa",
    "payment.waiting": "Waiting for M-Pesa approval…",
    "payment.simulate": "Simulate Payment (Demo)",
    "payment.success": "Payment Successful",
    "payment.failed": "Payment Failed",
    "common.loading": "Loading…",
    "common.save": "Save",
    "common.cancel": "Cancel",
    "common.noData": "No data available",
    "common.search": "Search…",
    "common.retry": "Retry",
    "common.back": "Back",
    "student.dataBalance": "Data remaining",
    "student.currentBundle": "Current Bundle",
    "student.buyMore": "Buy More Data",
    "student.viewAllocations": "View Allocations",
  },
  st: {
    "nav.dashboard": "Letlapa la Tshebetso",
    "nav.upload": "Kenya Faele",
    "nav.history": "Nalane",
    "nav.profile": "Profaele",
    "nav.allocations": "Kabo ea Data",
    "nav.buyData": "Reka Data",
    "nav.transactions": "Lits'ebeletso",
    "nav.support": "Tšehetso",
    "auth.signIn": "Kena",
    "auth.signOut": "Tsoa",
    "auth.email": "Aterese ea imeile",
    "auth.password": "Phasewete",
    "auth.forgotPassword": "U lebetse phasewete?",
    "upload.dropzone": "Lahlela CSV kapa XLSX mona, kapa tobetsa ho batla",
    "upload.validate": "Netefatsa Faele",
    "upload.proceedToPay": "Tsoela Pele ho Lefa",
    "upload.cancel": "Hlakola",
    "upload.validRows": "Mela e Nepahetseng",
    "upload.invalidRows": "Mela e Fosahetseng",
    "payment.pay": "Lefa ka M-Pesa",
    "payment.waiting": "E emetse tumello ea M-Pesa…",
    "payment.simulate": "Bontša Tefo (Demo)",
    "payment.success": "Tefo e Atlehile",
    "payment.failed": "Tefo e Hlōlehile",
    "common.loading": "E a laela…",
    "common.save": "Boloka",
    "common.cancel": "Hlakola",
    "common.noData": "Ha ho data e fumanehang",
    "common.search": "Batla…",
    "common.retry": "Leka hape",
    "common.back": "Khutlela",
    "student.dataBalance": "Data e setseng",
    "student.currentBundle": "Boutu ea Hona joale",
    "student.buyMore": "Reka Data e Eketsehileng",
    "student.viewAllocations": "Sheba Kabo",
  },
}

// ---------------------------------------------------------------------------
// useTranslation hook
// ---------------------------------------------------------------------------

const STORAGE_KEY = "vlap_lang"

/**
 * React hook that provides t(key) for translations and setLanguage() to switch.
 * Reads/writes the chosen language from localStorage. Defaults to English.
 *
 * Requirements: 12.8
 */
export function useTranslation() {
  const [lang, setLangState] = useState<Language>("en")

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(STORAGE_KEY) as Language | null
      if (stored === "en" || stored === "st") {
        setLangState(stored)
      }
    }
  }, [])

  const setLanguage = useCallback((newLang: Language) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, newLang)
    }
    setLangState(newLang)
  }, [])

  const t = useCallback(
    (key: string): string => {
      return translations[lang][key] ?? translations["en"][key] ?? key
    },
    [lang]
  )

  return { lang, t, setLanguage }
}
