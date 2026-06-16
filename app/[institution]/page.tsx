/**
 * Institution landing page
 *
 * Shows a branded hero, institution details, and a login CTA.
 * This is a Server Component — branding data flows down from the layout.
 *
 * Requirements: 1.2, 1.4, 1.5
 */

import Link from "next/link";
import { notFound } from "next/navigation";
import { getInstitutionById } from "@/lib/mock-data/institutions";

interface InstitutionPageProps {
  params: Promise<{ institution: string }>;
}

export default async function InstitutionPage({
  params,
}: InstitutionPageProps) {
  const { institution: institutionId } = await params;
  const institution = getInstitutionById(institutionId);

  if (!institution) {
    notFound();
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* ── Branded hero ───────────────────────────────────────────────── */}
      <header
        className="flex flex-col items-center justify-center py-24 px-6 text-white text-center"
        style={{ backgroundColor: institution.primaryColor }}
      >
        {/* Logo placeholder — initials circle */}
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold mb-6 ring-4 ring-white/30"
          style={{ backgroundColor: "rgba(255,255,255,0.2)" }}
        >
          {institution.shortName.slice(0, 2)}
        </div>

        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">
          {institution.name}
        </h1>
        <p className="text-lg opacity-90 max-w-md">
          Welcome to the {institution.shortName} Student Allocation
          Portal
        </p>

        <Link
          href={`/${institution.id}/login`}
          className="mt-8 inline-flex items-center justify-center rounded-lg bg-white px-6 py-3 text-sm font-semibold transition-opacity hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
          style={{ color: institution.primaryColor }}
        >
          Sign in to your portal
        </Link>
      </header>

      {/* ── Info section ───────────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-16 bg-zinc-50">
        <div className="max-w-md text-center">
          <h2 className="text-xl font-semibold text-zinc-800 mb-4">
            Automated data for students
          </h2>
          <p className="text-zinc-600 leading-relaxed">
            Administrators and SPOCs can upload student lists and provision
            Vodacom Lesotho data bundles in bulk. Students can track their
            allocations in real time.
          </p>
        </div>
      </main>

      {/* ── Footer ─────────────────────────────────────────────────────── */}
      <footer className="py-6 text-center text-xs text-zinc-500 border-t">
        Powered by VLAP | Vodacom Lesotho
      </footer>
    </div>
  );
}
