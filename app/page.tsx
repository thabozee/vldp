"use client";

/**
 * VLAP Landing Page
 * Three-role selector with searchable institution picker.
 * Vodacom Lesotho brand: #E60000 red + white only.
 */

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { INSTITUTIONS } from "@/lib/mock-data/institutions";
import type { Institution } from "@/lib/types";

type Role = "student" | "spoc" | "admin";

const ROLES: {
  value: Role;
  label: string;
  description: string;
  icon: string;
}[] = [
  {
    value: "student",
    label: "Student",
    description: "Access allocations and buy data bundles",
    icon: "🎓",
  },
  {
    value: "spoc",
    label: "School SPOC",
    description: "Upload student lists and initiate payments",
    icon: "🏫",
  },
  {
    value: "admin",
    label: "Vodacom Admin",
    description: "Manage provisioning across all institutions",
    icon: "⚙️",
  },
];

// Vodacom palette
const V = {
  red: "#E60000",
  darkRed: "#B30000",
  white: "#FFFFFF",
  bg: "#F5F5F5",
  border: "#E0E0E0",
  text: "#1A1A1A",
  sub: "#666666",
};

export default function LandingPage() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [selectedInstitution, setSelectedInstitution] = useState<string>("");
  const [search, setSearch] = useState("");

  const needsSchool = selectedRole === "student" || selectedRole === "spoc";

  const filteredInstitutions = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return INSTITUTIONS.filter((i) => i.active);
    return INSTITUTIONS.filter(
      (i) =>
        i.active &&
        (i.name.toLowerCase().includes(q) ||
          i.shortName.toLowerCase().includes(q) ||
          i.type.toLowerCase().includes(q)),
    );
  }, [search]);

  const canProceed =
    selectedRole !== null &&
    (selectedRole === "admin" || (needsSchool && selectedInstitution !== ""));

  function handleSignIn() {
    if (selectedRole === "admin") {
      router.push("/admin/login");
      return;
    }
    if (needsSchool && selectedInstitution) {
      router.push(`/${selectedInstitution}/login`);
    }
  }

  function handleRegister() {
    if (needsSchool && selectedInstitution && selectedRole === "student") {
      router.push(`/${selectedInstitution}/student/register`);
    }
  }

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: V.bg }}
    >
      {/* ── Header ─────────────────────────────────────────────────── */}
      <header
        className="w-full px-6 py-4 flex items-center justify-between"
        style={{ backgroundColor: V.red }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center font-black text-lg"
            style={{ backgroundColor: V.white, color: V.red }}
          >
            V
          </div>
          <div className="text-white">
            <p className="text-[11px] font-medium opacity-80 leading-none">
              Vodacom Lesotho
            </p>
            <p className="text-sm font-bold leading-none mt-0.5">VLAP</p>
          </div>
        </div>
        <span className="text-white text-xs opacity-70 hidden sm:block">
          Lesotho Allocation Portal
        </span>
      </header>

      {/* ── Hero ───────────────────────────────────────────────────── */}
      <section
        className="w-full px-6 py-12 text-center text-white"
        style={{ backgroundColor: V.red }}
      >
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight mb-2">
          Welcome to VLAP
        </h1>
        <p className="text-base opacity-90 max-w-lg mx-auto">
          Automated student data allocation for schools and universities across
          Lesotho.
        </p>
      </section>

      {/* ── Main ───────────────────────────────────────────────────── */}
      <main className="flex-1 w-full max-w-2xl mx-auto px-4 py-10 space-y-8">
        {/* Step 1 — Role */}
        <div>
          <p
            className="text-[11px] font-bold uppercase tracking-widest mb-3"
            style={{ color: V.red }}
          >
            Step 1 — Who are you?
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {ROLES.map(({ value, label, description, icon }) => {
              const active = selectedRole === value;
              return (
                <button
                  key={value}
                  onClick={() => {
                    setSelectedRole(value);
                    setSelectedInstitution("");
                    setSearch("");
                  }}
                  className="relative rounded-xl border-2 p-5 text-left transition-all focus:outline-none"
                  style={{
                    borderColor: active ? V.red : V.border,
                    backgroundColor: active ? "#FFF0F0" : V.white,
                    boxShadow: active ? `0 0 0 3px rgba(230,0,0,0.12)` : "none",
                  }}
                >
                  {active && (
                    <span
                      className="absolute top-3 right-3 w-4 h-4 rounded-full flex items-center justify-center text-white text-[10px]"
                      style={{ backgroundColor: V.red }}
                    >
                      ✓
                    </span>
                  )}
                  <span className="text-2xl mb-2 block">{icon}</span>
                  <p className="font-bold text-sm" style={{ color: V.text }}>
                    {label}
                  </p>
                  <p className="text-xs mt-1" style={{ color: V.sub }}>
                    {description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 2 — School picker (Student / SPOC) */}
        {needsSchool && (
          <div>
            <p
              className="text-[11px] font-bold uppercase tracking-widest mb-3"
              style={{ color: V.red }}
            >
              Step 2 — Select your school
            </p>

            {/* Search box */}
            <div className="relative mb-3">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                style={{ color: V.sub }}
              />
              <input
                type="text"
                placeholder="Search institutions…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border py-2.5 pl-9 pr-4 text-sm focus:outline-none focus:ring-2"
                style={{
                  borderColor: V.border,
                  backgroundColor: V.white,
                  color: V.text,
                  // @ts-expect-error — inline focus ring color
                  "--tw-ring-color": V.red,
                }}
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium"
                  style={{ color: V.sub }}
                >
                  ✕
                </button>
              )}
            </div>

            {/* Results */}
            {filteredInstitutions.length === 0 ? (
              <p className="text-sm text-center py-6" style={{ color: V.sub }}>
                No institutions match &ldquo;{search}&rdquo;
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-80 overflow-y-auto pr-1">
                {filteredInstitutions.map((inst: Institution) => {
                  const active = selectedInstitution === inst.id;
                  return (
                    <button
                      key={inst.id}
                      onClick={() => setSelectedInstitution(inst.id)}
                      className="flex items-center gap-3 rounded-xl border-2 p-4 text-left transition-all focus:outline-none"
                      style={{
                        borderColor: active ? V.red : V.border,
                        backgroundColor: active ? "#FFF0F0" : V.white,
                        boxShadow: active
                          ? `0 0 0 3px rgba(230,0,0,0.12)`
                          : "none",
                      }}
                    >
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-sm font-bold shrink-0"
                        style={{ backgroundColor: active ? V.red : "#AAAAAA" }}
                      >
                        {inst.shortName.slice(0, 2)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p
                          className="font-semibold text-sm truncate"
                          style={{ color: V.text }}
                        >
                          {inst.name}
                        </p>
                        <p
                          className="text-xs capitalize"
                          style={{ color: V.sub }}
                        >
                          {inst.type}
                        </p>
                      </div>
                      {active && (
                        <span
                          className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] shrink-0"
                          style={{ backgroundColor: V.red }}
                        >
                          ✓
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* CTAs */}
        {selectedRole && (
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={handleSignIn}
              disabled={!canProceed}
              className="flex-1 py-3 rounded-xl text-sm font-bold transition-all focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                backgroundColor: canProceed ? V.red : V.border,
                color: canProceed ? V.white : "#999",
              }}
            >
              Sign In
            </button>
            {selectedRole === "student" && (
              <button
                onClick={handleRegister}
                disabled={!canProceed}
                className="flex-1 py-3 rounded-xl text-sm font-bold border-2 transition-all focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed"
                style={{
                  borderColor: canProceed ? V.red : V.border,
                  color: canProceed ? V.red : "#999",
                  backgroundColor: V.white,
                }}
              >
                Register New Account
              </button>
            )}
          </div>
        )}
      </main>

      {/* ── Footer ─────────────────────────────────────────────────── */}
      <footer
        className="w-full py-4 text-center text-xs"
        style={{ borderTop: `1px solid ${V.border}`, color: V.sub }}
      >
        © {new Date().getFullYear()} Vodacom Lesotho · Powered by VLAP ·{" "}
        <a href="/terms" style={{ color: V.red }}>
          Terms
        </a>{" "}
        ·{" "}
        <a href="/privacy" style={{ color: V.red }}>
          Privacy
        </a>
      </footer>
    </div>
  );
}
