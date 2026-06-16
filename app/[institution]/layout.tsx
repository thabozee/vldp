/**
 * Institution-specific layout
 *
 * Server component: resolves the institution from the URL slug,
 * 404s if unknown, then wraps children in the InstitutionThemeProvider
 * so every page under /[institution] inherits the correct branding.
 *
 * Requirements: 1.2, 1.4, 1.5
 */

import { notFound } from "next/navigation";
import { InstitutionThemeProvider } from "@/components/institution-theme-provider";
import { getInstitutionById } from "@/lib/mock-data/institutions";
import type { InstitutionBranding } from "@/lib/types";

interface InstitutionLayoutProps {
  children: React.ReactNode;
  params: Promise<{ institution: string }>;
}

export default async function InstitutionLayout({
  children,
  params,
}: InstitutionLayoutProps) {
  const { institution: institutionId } = await params;
  const found = getInstitutionById(institutionId);

  if (!found) {
    notFound();
  }

  const branding: InstitutionBranding = {
    id: found.id,
    slug: found.slug,
    name: found.name,
    shortName: found.shortName,
    type: found.type,
    primaryColor: found.primaryColor,
    logoUrl: found.logoUrl,
    faviconUrl: found.faviconUrl,
  };

  return (
    <InstitutionThemeProvider institution={branding}>
      {children}
    </InstitutionThemeProvider>
  );
}
