"use client";

/**
 * Student self-registration
 * Requirements: 8.1, 8.2
 */

import { useState, use } from "react";
import { useRouter } from "next/navigation";
import { useInstitution } from "@/hooks/use-institution";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertTriangle, Loader2 } from "lucide-react";

interface RegisterPageProps {
  params: Promise<{ institution: string }>;
}

export default function StudentRegisterPage({ params }: RegisterPageProps) {
  const { institution: institution_id } = use(params);
  const { institution } = useInstitution();
  const router = useRouter();

  const [name, setName] = useState("");
  const [msisdn, setMsisdn] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/students/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          msisdn,
          institutionId: institution_id,
          password,
        }),
      });

      const data = (await res.json()) as {
        studentId?: string;
        message?: string;
        error?: string;
      };

      if (res.status === 409) {
        setError("A student with this phone number already exists.");
        return;
      }

      if (!res.ok) {
        setError(data.message ?? data.error ?? "Registration failed.");
        return;
      }

      router.push(`/${institution_id}/student/consent`);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50">
      <header
        className="py-6 px-6 text-white text-center"
        style={{ backgroundColor: institution.primaryColor }}
      >
        <h1 className="text-xl font-semibold">{institution.name}</h1>
        <p className="text-sm opacity-80 mt-1">Student Registration</p>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-sm">
          <Card>
            <CardHeader>
              <CardTitle className="text-base text-center">
                Create your account
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                <div className="space-y-1.5">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    required
                    placeholder="e.g. Thabo Molefe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={loading}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="msisdn">Phone Number (MSISDN)</Label>
                  <Input
                    id="msisdn"
                    required
                    placeholder="+26657XXXXXXX"
                    value={msisdn}
                    onChange={(e) => setMsisdn(e.target.value)}
                    disabled={loading}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="inst">Institution</Label>
                  <Input
                    id="inst"
                    value={institution.name}
                    readOnly
                    className="bg-zinc-50 text-zinc-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    required
                    placeholder="Min. 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="confirm-password">Confirm Password</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    required
                    placeholder="Repeat your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={loading}
                  />
                </div>

                {error && (
                  <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    {error}
                  </p>
                )}

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Registering…
                    </>
                  ) : (
                    "Create Account"
                  )}
                </Button>
              </form>

              <p className="text-xs text-zinc-500 text-center mt-4">
                Already have an account?{" "}
                <a href={`/${institution_id}/login`} className="underline">
                  Sign in
                </a>
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
