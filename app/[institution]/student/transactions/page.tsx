"use client";

/**
 * Student Transaction History
 * Requirements: 9.4
 */

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { PAYMENTS } from "@/lib/mock-data/payments";
import type { AuthUser, Payment } from "@/lib/types";
import { Receipt } from "lucide-react";

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-LS", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

const STATUS_STYLE: Record<Payment["status"], string> = {
  pending: "bg-blue-50 text-blue-700 border-blue-200",
  success: "bg-green-50 text-green-700 border-green-200",
  failed: "bg-red-50 text-red-700 border-red-200",
  cancelled: "bg-zinc-100 text-zinc-500",
};

const STATUS_LABEL: Record<Payment["status"], string> = {
  pending: "Pending",
  success: "Success",
  failed: "Failed",
  cancelled: "Cancelled",
};

export default function StudentTransactionsPage() {
  const params = useParams<{ institution: string }>();
  const institution_id = params.institution;
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [transactions, setTransactions] = useState<Payment[]>([]);

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

      // For students, filter payments where payerMSISDN matches their account
      // In the mock, student payments link via spocId; for self-purchase we use the student's id
      const selfPayments = PAYMENTS.filter(
        (p) =>
          p.spocId === parsed.id ||
          p.uploadId.startsWith(`self-${parsed.institutionId}`),
      ).sort((a, b) => b.createdAt.localeCompare(a.createdAt));

      setTransactions(selfPayments);
    } catch {
      router.replace(`/${institution_id}/login`);
    }
  }, [institution_id, router]);

  if (!user) return null;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-xl font-semibold text-zinc-900">My Transactions</h1>

      {transactions.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
            <Receipt className="w-10 h-10 text-zinc-300" />
            <p className="text-sm font-medium text-zinc-500">
              No transactions yet
            </p>
            <p className="text-xs text-zinc-400">
              Your data purchases will appear here.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-zinc-500 text-xs">
                  <th className="px-5 py-3 text-left font-medium">Date</th>
                  <th className="px-4 py-3 text-right font-medium">Amount</th>
                  <th className="px-4 py-3 text-left font-medium">Status</th>
                  <th className="px-4 py-3 text-left font-medium">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {transactions.map((t) => (
                  <tr key={t.id} className="hover:bg-zinc-50">
                    <td className="px-5 py-3 text-zinc-600">
                      {fmtDate(t.createdAt)}
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-zinc-900">
                      M{t.amount} LSL
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${STATUS_STYLE[t.status]}`}
                      >
                        {STATUS_LABEL[t.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs font-mono text-zinc-400">
                      {t.mpesaReceiptNumber ?? "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
