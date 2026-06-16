"use client";

/**
 * Institution login page
 *
 * Branded header + email/password form + role selection.
 * On submit: POST /api/auth/login, then redirect by role.
 *
 * Requirements: 1.2, 1.5, 2.1, 2.2, 2.3, 2.4
 */

import { useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useInstitution } from "@/hooks/use-institution";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { UserRole } from "@/lib/types";

const ROLE_OPTIONS: { value: UserRole; label: string }[] = [
  { value: "spoc", label: "SPOC" },
  { value: "student", label: "Student" },
];

interface LoginPageProps {
  params: Promise<{ institution: string }>;
}

export default function LoginPage({ params }: LoginPageProps) {
  const { institution: institutionId } = use(params);
  const { institution } = useInstitution();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("spoc");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          institutionSlug: institution.slug,
        }),
      });

      const data = (await res.json()) as {
        user?: { role: UserRole };
        error?: string;
      };

      if (!res.ok || !data.user) {
        setError(data.error ?? "Login failed. Please try again.");
        return;
      }

      // Redirect based on the role returned by the server
      const userRole = data.user.role;
      // Store user in localStorage so portal layouts can read auth state
      localStorage.setItem("vldp_user", JSON.stringify(data.user));

      if (userRole === "admin") {
        router.push(`/${institutionId}/admin`);
      } else if (userRole === "spoc") {
        router.push(`/${institutionId}/spoc`);
      } else {
        router.push(`/${institutionId}/student`);
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* ── Branded header ─────────────────────────────────────────────── */}
      <header
        className="py-6 px-6 text-white text-center"
        style={{ backgroundColor: institution.primaryColor }}
      >
        <h1 className="text-xl font-semibold">{institution.name}</h1>
        <p className="text-sm opacity-80 mt-1">
          Student Data Provisioning Portal
        </p>
      </header>

      {/* ── Login form ─────────────────────────────────────────────────── */}
      <main className="flex-1 flex items-center justify-center px-4 py-12 bg-zinc-50">
        <div className="w-full max-w-sm">
          <div className="bg-white rounded-xl ring-1 ring-zinc-200 p-8 shadow-sm">
            <h2 className="text-lg font-semibold text-zinc-900 mb-6 text-center">
              Sign in
            </h2>

            <form onSubmit={handleSubmit} noValidate className="space-y-5">
              {/* Email */}
              <div className="space-y-1.5">
                <Label htmlFor="email">Email address</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link
                    href="/(auth)/forgot-password"
                    className="text-xs text-zinc-500 hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                />
              </div>

              {/* Role selection */}
              <fieldset className="space-y-1.5">
                <legend className="text-sm font-medium text-zinc-700">
                  Role
                </legend>
                <div className="flex gap-4">
                  {ROLE_OPTIONS.map(({ value, label }) => (
                    <label
                      key={value}
                      className="flex items-center gap-1.5 text-sm cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="role"
                        value={value}
                        checked={role === value}
                        onChange={() => setRole(value)}
                        disabled={loading}
                        className="accent-current"
                        style={{ accentColor: institution.primaryColor }}
                      />
                      {label}
                    </label>
                  ))}
                </div>
              </fieldset>

              {/* Error banner */}
              {error && (
                <p
                  role="alert"
                  className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2"
                >
                  {error}
                </p>
              )}

              {/* Submit */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full text-white"
                style={{ backgroundColor: institution.primaryColor }}
              >
                {loading ? "Signing in…" : "Sign in"}
              </Button>
            </form>
          </div>
        </div>
      </main>

      {/* ── Footer ─────────────────────────────────────────────────────── */}
      <footer className="py-4 text-center text-xs text-zinc-500 border-t">
        Powered by VLDP | Vodacom Lesotho
      </footer>
    </div>
  );
}
