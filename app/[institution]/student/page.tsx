"use client";

/**
 * Student Home / Dashboard
 * Requirements: 8.1, 8.6, 5.9
 */

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { STUDENTS, getStudentByUserId } from "@/lib/mock-data/students";
import { BUNDLES } from "@/lib/mock-data/bundles";
import { NOTIFICATIONS_STORE } from "@/lib/mock-data/notifications";
import type { AuthUser, Student, Notification } from "@/lib/types";
import { Wifi, ShoppingCart, PackageOpen, Bell } from "lucide-react";

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-LS", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

const NOTIF_TYPE_LABEL: Record<Notification["type"], string> = {
  provisioning_complete: "Provisioned",
  provisioning_partial: "Partial",
  payment_failed: "Payment Failed",
  payment_success: "Payment Success",
  upload_ready: "Upload Ready",
  system: "System",
};

const NOTIF_TYPE_COLOR: Record<Notification["type"], string> = {
  provisioning_complete: "bg-green-50 text-green-700",
  provisioning_partial: "bg-yellow-50 text-yellow-700",
  payment_failed: "bg-red-50 text-red-700",
  payment_success: "bg-green-50 text-green-700",
  upload_ready: "bg-blue-50 text-blue-700",
  system: "bg-zinc-50 text-zinc-700",
};

export default function StudentHomePage() {
  const params = useParams<{ institution: string }>();
  const institution_id = params.institution;
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [student, setStudent] = useState<Student | null>(null);

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
    } catch {
      router.replace(`/${institution_id}/login`);
    }
  }, [institution_id, router]);

  if (!user) return null;

  const currentBundle = student?.currentBundleId
    ? BUNDLES.find((b) => b.id === student.currentBundleId)
    : null;

  const notifications = NOTIFICATIONS_STORE.filter(
    (n) => n.recipientId === user.id && !n.read,
  )
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 3);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-zinc-900">
          Hi, {user.name.split(" ")[0]} 👋
        </h1>
        <p className="text-sm text-zinc-500">Here's your data overview.</p>
      </div>

      {/* Data balance */}
      <Card className="overflow-hidden">
        <div className="bg-linear-to-br from-zinc-800 to-zinc-900 px-6 py-8 text-white text-center">
          <Wifi className="w-8 h-8 mx-auto mb-2 opacity-80" />
          <p className="text-4xl font-bold tracking-tight">
            {student?.dataBalance ?? "— GB"}
          </p>
          <p className="text-sm opacity-70 mt-1">Data remaining</p>
        </div>
      </Card>

      {/* Current bundle */}
      {currentBundle && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-zinc-500">
              Current Bundle
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-zinc-900">
                {currentBundle.name}
              </p>
              <p className="text-sm text-zinc-500">
                {currentBundle.size} · {currentBundle.validityDays} days
                validity
              </p>
            </div>
            <Badge variant="secondary">{currentBundle.size}</Badge>
          </CardContent>
        </Card>
      )}

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-4">
        <Link
          href={`/${institution_id}/student/buy-data`}
          className={cn(
            buttonVariants({ variant: "default" }),
            "h-16 flex-col gap-1 text-xs",
          )}
        >
          <ShoppingCart className="w-5 h-5" />
          Buy More Data
        </Link>
        <Link
          href={`/${institution_id}/student/allocations`}
          className={cn(
            buttonVariants({ variant: "outline" }),
            "h-16 flex-col gap-1 text-xs",
          )}
        >
          <PackageOpen className="w-5 h-5" />
          View Allocations
        </Link>
      </div>

      {/* Notifications */}
      {notifications.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Bell className="w-4 h-4" />
              Recent Notifications
              <span className="ml-auto text-xs font-normal text-zinc-400">
                {notifications.length} unread
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {notifications.map((n) => (
              <div key={n.id} className="flex items-start gap-3">
                <span
                  className={`mt-0.5 rounded-full px-2 py-0.5 text-[10px] font-medium ${NOTIF_TYPE_COLOR[n.type]}`}
                >
                  {NOTIF_TYPE_LABEL[n.type]}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-zinc-800 truncate">
                    {n.title}
                  </p>
                  <p className="text-xs text-zinc-500 line-clamp-2">
                    {n.message}
                  </p>
                  <p className="text-[10px] text-zinc-400 mt-0.5">
                    {fmtDate(n.createdAt)}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
