"use client";

/**
 * Student Buy Data — grid of bundles with payment modal
 * Requirements: 9.1, 9.2, 4.1
 */

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BUNDLES } from "@/lib/mock-data/bundles";
import { INSTITUTIONS } from "@/lib/mock-data/institutions";
import type { AuthUser, DataBundle } from "@/lib/types";
import { CheckCircle, X, Loader2, ShoppingCart } from "lucide-react";

interface ModalState {
  bundle: DataBundle | null;
  msisdn: string;
  loading: boolean;
  result: "idle" | "success" | "failed";
  receipt?: string;
}

export default function StudentBuyDataPage() {
  const params = useParams<{ institution: string }>();
  const institution_id = params.institution;
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [bundles, setBundles] = useState<DataBundle[]>([]);
  const [modal, setModal] = useState<ModalState>({
    bundle: null,
    msisdn: "",
    loading: false,
    result: "idle",
  });

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

      const inst = INSTITUTIONS.find((i) => i.id === parsed.institutionId);
      const tier = inst?.type ?? "tertiary";
      const filtered = BUNDLES.filter(
        (b) => b.active && b.targetTiers.includes(tier),
      );
      setBundles(filtered);
    } catch {
      router.replace(`/${institution_id}/login`);
    }
  }, [institution_id, router]);

  if (!user) return null;

  function openModal(bundle: DataBundle) {
    setModal({ bundle, msisdn: "", loading: false, result: "idle" });
  }

  function closeModal() {
    setModal({ bundle: null, msisdn: "", loading: false, result: "idle" });
  }

  async function handleConfirmPayment() {
    if (!modal.bundle || !modal.msisdn.trim()) return;
    setModal((m) => ({ ...m, loading: true }));

    // Mock payment — 500ms delay then success
    await new Promise((r) => setTimeout(r, 1200));

    const receipt = `RCP${Math.random().toString(36).slice(2, 10).toUpperCase()}`;
    setModal((m) => ({ ...m, loading: false, result: "success", receipt }));
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-xl font-semibold text-zinc-900">Buy Data</h1>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {bundles.map((b) => (
          <Card key={b.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4 flex flex-col gap-2">
              <div className="flex items-start justify-between gap-1">
                <p className="text-sm font-semibold text-zinc-900 leading-tight">
                  {b.name}
                </p>
                <Badge variant="secondary" className="text-xs shrink-0">
                  {b.size}
                </Badge>
              </div>
              <p className="text-xs text-zinc-500">
                {b.validityDays} days validity
              </p>
              <p className="text-lg font-bold text-zinc-900">
                M{b.price}{" "}
                <span className="text-xs font-normal text-zinc-500">LSL</span>
              </p>
              <Button
                size="sm"
                className="w-full mt-1 text-xs"
                onClick={() => openModal(b)}
              >
                <ShoppingCart className="w-3.5 h-3.5 mr-1" />
                Buy
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Payment modal */}
      {modal.bundle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl relative">
            <button
              className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-700"
              onClick={closeModal}
              disabled={modal.loading}
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            {modal.result === "success" ? (
              <div className="flex flex-col items-center gap-3 py-4 text-center">
                <CheckCircle className="w-10 h-10 text-green-500" />
                <p className="font-semibold text-zinc-900">
                  Purchase Successful!
                </p>
                <p className="text-sm text-zinc-500">
                  {modal.bundle.name} — {modal.bundle.size} activated.
                </p>
                <p className="text-xs font-mono text-zinc-400">
                  Receipt: {modal.receipt}
                </p>
                <Button variant="outline" className="mt-2" onClick={closeModal}>
                  Done
                </Button>
              </div>
            ) : modal.result === "failed" ? (
              <div className="flex flex-col items-center gap-3 py-4 text-center">
                <X className="w-10 h-10 text-red-500" />
                <p className="font-semibold text-zinc-900">Payment Failed</p>
                <Button
                  variant="outline"
                  onClick={() => setModal((m) => ({ ...m, result: "idle" }))}
                >
                  Try Again
                </Button>
              </div>
            ) : (
              <>
                <h3 className="text-base font-semibold text-zinc-900 mb-1">
                  Confirm Purchase
                </h3>
                <p className="text-sm text-zinc-500 mb-4">
                  {modal.bundle.name} — M{modal.bundle.price} LSL
                </p>

                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="modal-msisdn">M-Pesa Phone Number</Label>
                    <Input
                      id="modal-msisdn"
                      placeholder="+26657XXXXXXX"
                      value={modal.msisdn}
                      onChange={(e) =>
                        setModal((m) => ({ ...m, msisdn: e.target.value }))
                      }
                      disabled={modal.loading}
                    />
                  </div>

                  <Button
                    className="w-full"
                    disabled={!modal.msisdn.trim() || modal.loading}
                    onClick={handleConfirmPayment}
                  >
                    {modal.loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processing…
                      </>
                    ) : (
                      `Pay M${modal.bundle.price} LSL`
                    )}
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
