import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ToasterClient } from "@/components/shared/toaster-client";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "VLAP — Vodacom Lesotho Allocation Portal",
  description:
    "Multi-tenant self-service web portal for automated student data allocation for Vodacom Lesotho.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      // CSS variable --institution-primary is set on :root in globals.css (Vodacom red #E60000 default)
      // and overridden per-institution by InstitutionThemeProvider (task 8.1)
    >
      <body className="min-h-full flex flex-col">
        {children}
        <ToasterClient />
      </body>
    </html>
  );
}
