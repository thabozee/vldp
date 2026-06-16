"use client";

import { useTranslation, type Language } from "@/lib/i18n";

const OPTIONS: { value: Language; label: string }[] = [
  { value: "en", label: "EN" },
  { value: "st", label: "ST" },
];

export function LanguageSwitcher() {
  const { lang, setLanguage } = useTranslation();

  return (
    <div className="flex rounded-md border border-zinc-200 overflow-hidden text-xs font-medium">
      {OPTIONS.map(({ value, label }) => (
        <button
          key={value}
          onClick={() => setLanguage(value)}
          className={`px-2.5 py-1 transition-colors ${
            lang === value
              ? "bg-zinc-900 text-white"
              : "bg-white text-zinc-500 hover:bg-zinc-50"
          }`}
          aria-pressed={lang === value}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
