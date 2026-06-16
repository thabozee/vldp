"use client";

/**
 * Vodacom Admin Login — /admin/login
 * Dedicated login page for Vodacom staff only.
 * No institution picker needed. Always logs in as admin.
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const V = {
  red: "#E60000",
  darkRed: "#B30000",
  white: "#FFFFFF",
  bg: "#F5F5F5",
  border: "#E0E0E0",
  text: "#1A1A1A",
  sub: "#666666",
};

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Admin login — single Vodacom admin, no institution slug needed
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        setError(data.error ?? "Invalid credentials.");
        return;
      }

      const data = (await res.json()) as {
        user?: { role: string; institutionId: string };
      };

      if (!data.user || data.user.role !== "admin") {
        setError("This account does not have Admin access.");
        return;
      }

      // Store in localStorage for client-side auth checks
      localStorage.setItem("vldp_user", JSON.stringify(data.user));

      // Admin dashboard — cross-institution view
      router.push(`/admin/dashboard`);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: V.bg }}
    >
      {/* Header */}
      <header
        className="w-full px-6 py-4 flex items-center gap-3"
        style={{ backgroundColor: V.red }}
      >
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
          <p className="text-sm font-bold leading-none mt-0.5">
            VLAP — Admin Portal
          </p>
        </div>
      </header>

      {/* Red accent bar */}
      <div className="w-full h-1" style={{ backgroundColor: V.darkRed }} />

      {/* Login form */}
      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-sm">
          {/* Card */}
          <div className="rounded-2xl overflow-hidden shadow-lg">
            {/* Card header */}
            <div
              className="px-8 py-7 text-white"
              style={{ backgroundColor: V.red }}
            >
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center font-black text-xl mb-4"
                style={{ backgroundColor: "rgba(255,255,255,0.2)" }}
              >
                ⚙️
              </div>
              <h1 className="text-xl font-black">Admin Sign In</h1>
              <p className="text-sm opacity-80 mt-1">
                Vodacom staff access only
              </p>
            </div>

            {/* Card body */}
            <div className="bg-white px-8 py-7 space-y-5">
              <form onSubmit={handleSubmit} noValidate className="space-y-4">
                <div className="space-y-1.5">
                  <label
                    htmlFor="email"
                    className="text-xs font-semibold uppercase tracking-wide"
                    style={{ color: V.sub }}
                  >
                    Email address
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="admin@institution.ac.ls"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    className="w-full rounded-lg border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 disabled:opacity-50"
                    style={
                      {
                        borderColor: V.border,
                        color: V.text,
                        "--tw-ring-color": V.red,
                      } as React.CSSProperties
                    }
                  />
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="password"
                    className="text-xs font-semibold uppercase tracking-wide"
                    style={{ color: V.sub }}
                  >
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    required
                    autoComplete="current-password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    className="w-full rounded-lg border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 disabled:opacity-50"
                    style={
                      {
                        borderColor: V.border,
                        color: V.text,
                        "--tw-ring-color": V.red,
                      } as React.CSSProperties
                    }
                  />
                </div>

                {error && (
                  <div
                    className="rounded-lg border px-3 py-2.5 text-sm"
                    style={{
                      borderColor: "#FECACA",
                      backgroundColor: "#FEF2F2",
                      color: "#DC2626",
                    }}
                  >
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || !email || !password}
                  className="w-full py-3 rounded-lg text-sm font-bold text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ backgroundColor: V.red }}
                >
                  {loading ? "Signing in…" : "Sign In as Admin"}
                </button>
              </form>

              <div className="text-center">
                <Link href="/" className="text-xs" style={{ color: V.sub }}>
                  ← Not an admin? Go back
                </Link>
              </div>
            </div>
          </div>

          {/* Hint */}
          <p className="text-center text-xs mt-4" style={{ color: V.sub }}>
            Demo: admin@nul.ac.ls / Admin@123
          </p>
        </div>
      </main>

      <footer className="py-4 text-center text-xs" style={{ color: V.sub }}>
        © {new Date().getFullYear()} Vodacom Lesotho · VLAP
      </footer>
    </div>
  );
}
