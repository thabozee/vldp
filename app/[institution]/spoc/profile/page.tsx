"use client";

/**
 * SPOC Profile page
 * Requirements: 2.1, 5.9
 */

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { INSTITUTIONS } from "@/lib/mock-data/institutions";
import type { AuthUser } from "@/lib/types";
import { User, Mail, Building2, Shield, Bell } from "lucide-react";

export default function SpocProfilePage() {
  const params = useParams<{ institution: string }>();
  const institution_id = params.institution;
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [emailNotif, setEmailNotif] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("vldp_user");
      if (!stored) {
        router.replace(`/${institution_id}/login`);
        return;
      }
      const parsed = JSON.parse(stored) as AuthUser;
      if (parsed.role !== "spoc") {
        router.replace(`/${institution_id}/login`);
        return;
      }
      setUser(parsed);

      const pref = localStorage.getItem(`vldp_notif_${parsed.id}`);
      setEmailNotif(pref === "true");
    } catch {
      router.replace(`/${institution_id}/login`);
    }
  }, [institution_id, router]);

  if (!user) return null;

  const inst = INSTITUTIONS.find((i) => i.id === user.institutionId);

  function handleToggleNotif() {
    const next = !emailNotif;
    setEmailNotif(next);
    localStorage.setItem(`vldp_notif_${user!.id}`, String(next));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-xl font-semibold text-zinc-900">Profile</h1>

      {/* Profile details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Account Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-zinc-100">
              <User className="w-4 h-4 text-zinc-600" />
            </div>
            <div>
              <p className="text-xs text-zinc-400">Full Name</p>
              <p className="text-sm font-medium text-zinc-900">{user.name}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-zinc-100">
              <Mail className="w-4 h-4 text-zinc-600" />
            </div>
            <div>
              <p className="text-xs text-zinc-400">Email</p>
              <p className="text-sm font-medium text-zinc-900">{user.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-zinc-100">
              <Building2 className="w-4 h-4 text-zinc-600" />
            </div>
            <div>
              <p className="text-xs text-zinc-400">Institution</p>
              <p className="text-sm font-medium text-zinc-900">
                {inst?.name ?? user.institutionId}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-zinc-100">
              <Shield className="w-4 h-4 text-zinc-600" />
            </div>
            <div>
              <p className="text-xs text-zinc-400">Role</p>
              <Badge variant="secondary" className="capitalize mt-0.5">
                {user.role}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notification preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Notification Preferences</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell className="w-4 h-4 text-zinc-600" />
              <div>
                <p className="text-sm font-medium text-zinc-800">
                  Email notifications
                </p>
                <p className="text-xs text-zinc-400">
                  Receive upload & payment status updates via email
                </p>
              </div>
            </div>
            <button
              role="switch"
              aria-checked={emailNotif}
              onClick={handleToggleNotif}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-zinc-400 ${
                emailNotif ? "bg-zinc-900" : "bg-zinc-300"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  emailNotif ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          {saved && (
            <p className="text-xs text-green-600 mt-3">Preferences saved.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
