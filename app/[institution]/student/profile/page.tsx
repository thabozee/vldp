"use client";

/**
 * Student Profile — display info, update phone, notification preferences
 * Requirements: 8.5, 8.6
 */

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getStudentByUserId } from "@/lib/mock-data/students";
import { INSTITUTIONS } from "@/lib/mock-data/institutions";
import type { AuthUser, Student } from "@/lib/types";
import {
  User,
  Phone,
  Building2,
  Calendar,
  Wifi,
  Bell,
  CheckCircle,
  Loader2,
  AlertTriangle,
} from "lucide-react";

type OtpStep = "idle" | "awaiting_otp" | "verifying" | "done";

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-LS", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function StudentProfilePage() {
  const params = useParams<{ institution: string }>();
  const institution_id = params.institution;
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [student, setStudent] = useState<Student | null>(null);

  // Phone update
  const [newMsisdn, setNewMsisdn] = useState("");
  const [otp, setOtp] = useState("");
  const [otpStep, setOtpStep] = useState<OtpStep>("idle");
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [phoneSuccess, setPhoneSuccess] = useState(false);

  // Notifications
  const [emailNotif, setEmailNotif] = useState(false);
  const [smsNotif, setSmsNotif] = useState(false);
  const [prefSaved, setPrefSaved] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("vldp_user");
      if (!stored) {
        router.replace(`/${institution_id}/login`);
        return;
      }
      const parsed = JSON.parse(stored) as AuthUser;
      if (parsed.role !== "student") {
        router.replace(`/${institution_id}/login`);
        return;
      }
      setUser(parsed);

      const s = getStudentByUserId(parsed.id);
      setStudent(s ?? null);

      const prefEmail = localStorage.getItem(`vldp_notif_email_${parsed.id}`);
      const prefSms = localStorage.getItem(`vldp_notif_sms_${parsed.id}`);
      setEmailNotif(prefEmail === "true");
      setSmsNotif(prefSms === "true");
    } catch {
      router.replace(`/${institution_id}/login`);
    }
  }, [institution_id, router]);

  if (!user) return null;

  const inst = INSTITUTIONS.find((i) => i.id === user.institutionId);

  function handleSendOtp() {
    setPhoneError(null);
    if (!newMsisdn.trim() || newMsisdn.length < 8) {
      setPhoneError("Enter a valid phone number.");
      return;
    }
    // Mock OTP — any 6 digits accepted
    setOtpStep("awaiting_otp");
  }

  async function handleVerifyOtp() {
    setPhoneError(null);
    if (otp.length !== 6 || !/^\d{6}$/.test(otp)) {
      setPhoneError("Enter a 6-digit OTP.");
      return;
    }
    setOtpStep("verifying");
    await new Promise((r) => setTimeout(r, 800));
    setOtpStep("done");
    setPhoneSuccess(true);
    // Mock: update local student MSISDN display
    if (student) setStudent({ ...student, msisdn: newMsisdn });
    setNewMsisdn("");
    setOtp("");
    setTimeout(() => setPhoneSuccess(false), 3000);
  }

  function handleToggleNotif(type: "email" | "sms") {
    if (type === "email") {
      const next = !emailNotif;
      setEmailNotif(next);
      localStorage.setItem(`vldp_notif_email_${user!.id}`, String(next));
    } else {
      const next = !smsNotif;
      setSmsNotif(next);
      localStorage.setItem(`vldp_notif_sms_${user!.id}`, String(next));
    }
    setPrefSaved(true);
    setTimeout(() => setPrefSaved(false), 2000);
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-xl font-semibold text-zinc-900">My Profile</h1>

      {/* Account details */}
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
              <Phone className="w-4 h-4 text-zinc-600" />
            </div>
            <div>
              <p className="text-xs text-zinc-400">MSISDN</p>
              <p className="text-sm font-medium text-zinc-900">
                {student?.msisdn ?? "—"}
              </p>
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
              <Calendar className="w-4 h-4 text-zinc-600" />
            </div>
            <div>
              <p className="text-xs text-zinc-400">Registered</p>
              <p className="text-sm font-medium text-zinc-900">
                {student?.registrationDate
                  ? fmtDate(student.registrationDate)
                  : "—"}
              </p>
            </div>
          </div>
          {student?.dataBalance && (
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-zinc-100">
                <Wifi className="w-4 h-4 text-zinc-600" />
              </div>
              <div>
                <p className="text-xs text-zinc-400">Data Balance</p>
                <p className="text-sm font-medium text-zinc-900">
                  {student.dataBalance}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Update phone */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Update Phone Number</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {phoneSuccess && (
            <div className="flex items-center gap-2 text-green-600 text-sm">
              <CheckCircle className="w-4 h-4" /> Phone number updated
              successfully.
            </div>
          )}

          {otpStep === "idle" || otpStep === "done" ? (
            <div className="flex gap-2">
              <Input
                placeholder="New MSISDN e.g. +26657XXXXXXX"
                value={newMsisdn}
                onChange={(e) => setNewMsisdn(e.target.value)}
                className="flex-1"
              />
              <Button variant="outline" onClick={handleSendOtp}>
                Send OTP
              </Button>
            </div>
          ) : null}

          {otpStep === "awaiting_otp" && (
            <div className="space-y-3">
              <p className="text-xs text-zinc-500">
                Enter the 6-digit OTP sent to {newMsisdn}
              </p>
              <div className="flex gap-2">
                <Input
                  placeholder="6-digit OTP"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="flex-1 font-mono tracking-widest text-center"
                />
                <Button onClick={handleVerifyOtp} disabled={otp.length !== 6}>
                  Verify & Update
                </Button>
              </div>
            </div>
          )}

          {otpStep === "verifying" && (
            <div className="flex items-center gap-2 text-zinc-600 text-sm">
              <Loader2 className="w-4 h-4 animate-spin" /> Verifying OTP…
            </div>
          )}

          {phoneError && (
            <p className="text-sm text-red-600 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" /> {phoneError}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Notification preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Notification Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            {
              key: "email" as const,
              label: "Email notifications",
              desc: "Receive allocation & payment updates via email",
            },
            {
              key: "sms" as const,
              label: "SMS notifications",
              desc: "Receive updates via SMS to your registered number",
            },
          ].map(({ key, label, desc }) => {
            const checked = key === "email" ? emailNotif : smsNotif;
            return (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Bell className="w-4 h-4 text-zinc-600" />
                  <div>
                    <p className="text-sm font-medium text-zinc-800">{label}</p>
                    <p className="text-xs text-zinc-400">{desc}</p>
                  </div>
                </div>
                <button
                  role="switch"
                  aria-checked={checked}
                  onClick={() => handleToggleNotif(key)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-zinc-400 ${
                    checked ? "bg-zinc-900" : "bg-zinc-300"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${checked ? "translate-x-6" : "translate-x-1"}`}
                  />
                </button>
              </div>
            );
          })}
          {prefSaved && (
            <p className="text-xs text-green-600">Preferences saved.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
