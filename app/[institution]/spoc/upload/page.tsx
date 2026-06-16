"use client";

/**
 * SPOC Upload — multi-step: File Selection → Validation Results → Payment
 * Requirements: 3.1–3.10, 4.1–4.6
 */

import { useRef, useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { BUNDLES } from "@/lib/mock-data/bundles";
import { INSTITUTIONS } from "@/lib/mock-data/institutions";
import type { AuthUser, DataBundle, ValidationResult } from "@/lib/types";
import {
  Upload,
  FileText,
  CheckCircle,
  XCircle,
  Loader2,
  AlertTriangle,
} from "lucide-react";

type Step = 1 | 2 | 3;

interface PaymentState {
  status: "idle" | "waiting" | "success" | "failed";
  receiptNumber?: string;
  errorMessage?: string;
}

export default function SpocUploadPage() {
  const params = useParams<{ institution: string }>();
  const institution_id = params.institution;
  const router = useRouter();

  const [user, setUser] = useState<AuthUser | null>(null);
  const [step, setStep] = useState<Step>(1);

  // Step 1 state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedBundleId, setSelectedBundleId] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [validating, setValidating] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Step 2 state
  const [validationResult, setValidationResult] =
    useState<ValidationResult | null>(null);
  const [uploadId, setUploadId] = useState<string | null>(null);

  // Step 3 state
  const [payerMSISDN, setPayerMSISDN] = useState("");
  const [payment, setPayment] = useState<PaymentState>({ status: "idle" });

  // Institution + bundles
  const [institutionTier, setInstitutionTier] = useState<
    "tertiary" | "secondary" | "primary"
  >("tertiary");
  const [availableBundles, setAvailableBundles] = useState<DataBundle[]>([]);

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

      const inst = INSTITUTIONS.find((i) => i.id === parsed.institutionId);
      const tier = inst?.type ?? "tertiary";
      setInstitutionTier(tier);

      const filtered = BUNDLES.filter(
        (b) => b.active && b.targetTiers.includes(tier),
      );
      setAvailableBundles(filtered);
      if (filtered.length > 0) setSelectedBundleId(filtered[0].id);
    } catch {
      router.replace(`/${institution_id}/login`);
    }
  }, [institution_id, router]);

  if (!user) return null;

  const selectedBundle = availableBundles.find(
    (b) => b.id === selectedBundleId,
  );

  // ── Step 1: File Selection ──────────────────────────────────────────────

  function handleFileChange(file: File | null) {
    if (!file) return;
    const name = file.name.toLowerCase();
    if (!name.endsWith(".csv") && !name.endsWith(".xlsx")) {
      setUploadError("Only .csv and .xlsx files are accepted.");
      return;
    }
    setSelectedFile(file);
    setUploadError(null);
  }

  async function handleValidate() {
    if (!selectedFile || !selectedBundleId) return;
    setValidating(true);
    setUploadError(null);

    const stored = localStorage.getItem("vldp_user");
    const token = stored ? (JSON.parse(stored) as AuthUser).token : "";

    try {
      const fd = new FormData();
      fd.append("file", selectedFile);
      fd.append("institutionId", user!.institutionId);
      fd.append("bundleId", selectedBundleId);

      const res = await fetch("/api/uploads", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });

      const data = (await res.json()) as {
        validationResult?: ValidationResult;
        uploadId?: string;
        error?: string;
        message?: string;
      };

      if (!res.ok) {
        setUploadError(data.message ?? data.error ?? "Upload failed.");
        return;
      }

      setValidationResult(data.validationResult!);
      setUploadId(data.uploadId!);
      setStep(2);
    } catch (e) {
      setUploadError("Network error. Please try again.");
    } finally {
      setValidating(false);
    }
  }

  // ── Step 3: Payment ─────────────────────────────────────────────────────

  async function handlePay() {
    if (!uploadId || !payerMSISDN || !selectedBundle || !validationResult)
      return;
    setPayment({ status: "waiting" });

    const stored = localStorage.getItem("vldp_user");
    const token = stored ? (JSON.parse(stored) as AuthUser).token : "";
    const amount = validationResult.summary.valid * selectedBundle.price;

    try {
      // Initiate payment
      const res = await fetch("/api/payments/initiate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ uploadId, payerMSISDN, amount }),
      });

      if (!res.ok) {
        const d = (await res.json()) as { message?: string };
        setPayment({
          status: "failed",
          errorMessage: d.message ?? "Payment initiation failed.",
        });
        return;
      }

      // Simulate M-Pesa result for demo
      await new Promise((r) => setTimeout(r, 1500));

      const simRes = await fetch("/api/payments/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uploadId, success: true }),
      });

      if (simRes.ok) {
        setPayment({ status: "success", receiptNumber: `SIM${Date.now()}` });
      } else {
        setPayment({ status: "failed", errorMessage: "Payment was declined." });
      }
    } catch {
      setPayment({
        status: "failed",
        errorMessage: "Network error. Please retry.",
      });
    }
  }

  // ── Render ───────────────────────────────────────────────────────────────

  const stepLabels = ["File Selection", "Validation Results", "Payment"];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-xl font-semibold text-zinc-900">
        Upload Student List
      </h1>

      {/* Step indicator */}
      <div className="flex items-center gap-2">
        {stepLabels.map((label, i) => {
          const n = (i + 1) as Step;
          const isActive = step === n;
          const isDone = step > n;
          return (
            <div key={label} className="flex items-center gap-2">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                  isDone
                    ? "bg-green-500 text-white"
                    : isActive
                      ? "bg-zinc-900 text-white"
                      : "bg-zinc-200 text-zinc-500"
                }`}
              >
                {isDone ? <CheckCircle className="w-4 h-4" /> : n}
              </div>
              <span
                className={`text-sm hidden sm:block ${isActive ? "font-medium text-zinc-900" : "text-zinc-400"}`}
              >
                {label}
              </span>
              {i < stepLabels.length - 1 && (
                <div className="w-6 h-px bg-zinc-200" />
              )}
            </div>
          );
        })}
      </div>

      {/* Step 1 */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Select File & Bundle</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Drag-and-drop */}
            <div
              className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer ${
                dragOver
                  ? "border-blue-400 bg-blue-50"
                  : "border-zinc-300 hover:border-zinc-400"
              }`}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                handleFileChange(e.dataTransfer.files[0] ?? null);
              }}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.xlsx"
                className="sr-only"
                onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
              />
              {selectedFile ? (
                <div className="flex items-center justify-center gap-2 text-zinc-700">
                  <FileText className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-medium">
                    {selectedFile.name}
                  </span>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload className="w-10 h-10 text-zinc-400 mx-auto" />
                  <p className="text-sm text-zinc-600 font-medium">
                    Drag & drop or click to browse
                  </p>
                  <p className="text-xs text-zinc-400">
                    .CSV or .XLSX files only
                  </p>
                </div>
              )}
            </div>

            {/* Download sample template */}
            <div className="flex items-center justify-between rounded-lg border border-dashed border-zinc-200 px-4 py-3 bg-zinc-50">
              <div>
                <p className="text-sm font-medium text-zinc-700">
                  Not sure what format to use?
                </p>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Download the sample CSV template to see the required columns.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  const csv = [
                    "name,msisdn,grade",
                    "Thabo Molefe,+26657210001,Year 3",
                    "Palesa Mokoena,+26658220002,Year 1",
                    "Kelechi Nwosu,+26659330003,HND2",
                    "Amara Dlamini,+26657440004,Form D",
                    "Lerato Sithole,+26658550005,Grade 7",
                  ].join("\n");
                  const blob = new Blob([csv], { type: "text/csv" });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = "vldp-student-upload-template.csv";
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                className="ml-4 shrink-0 flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-white transition-opacity hover:opacity-90"
                style={{ backgroundColor: "#E60000" }}
              >
                ⬇ Sample CSV
              </button>
            </div>

            {/* Bundle selector */}
            <div className="space-y-1.5">
              <Label htmlFor="bundle">Data Bundle</Label>
              <select
                id="bundle"
                className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400"
                value={selectedBundleId}
                onChange={(e) => setSelectedBundleId(e.target.value)}
              >
                {availableBundles.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} — M{b.price} LSL ({b.size}, {b.validityDays} days)
                  </option>
                ))}
              </select>
            </div>

            {uploadError && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                {uploadError}
              </p>
            )}

            <Button
              className="w-full"
              disabled={!selectedFile || !selectedBundleId || validating}
              onClick={handleValidate}
            >
              {validating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Validating…
                </>
              ) : (
                "Validate File"
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Step 2 */}
      {step === 2 && validationResult && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Validation Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-green-50 rounded-xl p-4 text-center border border-green-200">
                <p className="text-3xl font-bold text-green-700">
                  {validationResult.summary.valid}
                </p>
                <p className="text-xs text-green-600 mt-1 font-medium">
                  Valid Rows
                </p>
              </div>
              <div className="bg-red-50 rounded-xl p-4 text-center border border-red-200">
                <p className="text-3xl font-bold text-red-600">
                  {validationResult.summary.invalid}
                </p>
                <p className="text-xs text-red-500 mt-1 font-medium">
                  Invalid Rows
                </p>
              </div>
            </div>

            {/* Invalid rows table */}
            {validationResult.invalidRows.length > 0 && (
              <div>
                <p className="text-sm font-medium text-zinc-700 mb-2">
                  Rejected Rows
                </p>
                <div className="overflow-x-auto rounded-lg border border-zinc-200">
                  <table className="w-full text-xs">
                    <thead className="bg-zinc-50">
                      <tr>
                        <th className="px-3 py-2 text-left text-zinc-500 font-medium">
                          #
                        </th>
                        <th className="px-3 py-2 text-left text-zinc-500 font-medium">
                          Name
                        </th>
                        <th className="px-3 py-2 text-left text-zinc-500 font-medium">
                          MSISDN
                        </th>
                        <th className="px-3 py-2 text-left text-zinc-500 font-medium">
                          Error
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                      {validationResult.invalidRows.map((row) => (
                        <tr key={row.rowIndex} className="bg-red-50/50">
                          <td className="px-3 py-2 text-zinc-500">
                            {row.rowIndex}
                          </td>
                          <td className="px-3 py-2 text-zinc-700">
                            {row.name || "—"}
                          </td>
                          <td className="px-3 py-2 font-mono text-zinc-700">
                            {row.msisdn || "—"}
                          </td>
                          <td className="px-3 py-2">
                            {row.errors.map((e, i) => (
                              <span key={i} className="text-red-600">
                                {e.code}
                                {i < row.errors.length - 1 ? ", " : ""}
                              </span>
                            ))}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setStep(1);
                  setValidationResult(null);
                  setUploadId(null);
                  setSelectedFile(null);
                }}
              >
                Cancel
              </Button>
              <Button
                className="flex-1"
                disabled={validationResult.summary.valid === 0}
                onClick={() => setStep(3)}
              >
                Proceed to Pay
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3 */}
      {step === 3 && validationResult && selectedBundle && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Payment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Summary */}
            <div className="bg-zinc-50 rounded-xl border p-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-zinc-500">Valid students</span>
                <span className="font-medium">
                  {validationResult.summary.valid}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Bundle price</span>
                <span className="font-medium">M{selectedBundle.price} LSL</span>
              </div>
              <div className="flex justify-between border-t pt-2 mt-2">
                <span className="font-semibold">Total</span>
                <span className="font-bold text-base">
                  M{validationResult.summary.valid * selectedBundle.price} LSL
                </span>
              </div>
            </div>

            {payment.status === "idle" || payment.status === "waiting" ? (
              <>
                <div className="space-y-1.5">
                  <Label htmlFor="payer-msisdn">
                    M-Pesa Phone Number (Payer)
                  </Label>
                  <Input
                    id="payer-msisdn"
                    placeholder="+26657XXXXXXX"
                    value={payerMSISDN}
                    onChange={(e) => setPayerMSISDN(e.target.value)}
                    disabled={payment.status === "waiting"}
                  />
                </div>

                {payment.status === "waiting" ? (
                  <div className="flex flex-col items-center gap-3 py-4">
                    <Loader2 className="w-8 h-8 animate-spin text-zinc-600" />
                    <p className="text-sm text-zinc-600">
                      Waiting for M-Pesa approval…
                    </p>
                  </div>
                ) : (
                  <Button
                    className="w-full"
                    disabled={!payerMSISDN.trim()}
                    onClick={handlePay}
                  >
                    Pay M{validationResult.summary.valid * selectedBundle.price}{" "}
                    LSL
                  </Button>
                )}
              </>
            ) : payment.status === "success" ? (
              <div className="flex flex-col items-center gap-3 py-4 text-center">
                <CheckCircle className="w-10 h-10 text-green-500" />
                <p className="font-semibold text-zinc-900">
                  Payment Successful!
                </p>
                <p className="text-sm text-zinc-500">
                  Receipt:{" "}
                  <span className="font-mono">{payment.receiptNumber}</span>
                </p>
                <p className="text-sm text-zinc-500">
                  Provisioning has started. You'll be notified when complete.
                </p>
                <a
                  href={`/${institution_id}/spoc`}
                  className={cn(buttonVariants({ variant: "outline" }), "mt-2")}
                >
                  Back to Overview
                </a>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3 py-4 text-center">
                <XCircle className="w-10 h-10 text-red-500" />
                <p className="font-semibold text-zinc-900">Payment Failed</p>
                <p className="text-sm text-red-600">{payment.errorMessage}</p>
                <Button
                  variant="outline"
                  onClick={() => setPayment({ status: "idle" })}
                >
                  Try Again
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
