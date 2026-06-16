"use client";

/**
 * SPOC — Upload Master List
 *
 * The SPOC uploads the full academic-year student list (name + MSISDN).
 * The system validates each MSISDN:
 *   - Format check (Lesotho +266 57/58/59 pattern)
 *   - Active check (MSISDN is not suspended in student store)
 *
 * No payment or provisioning is triggered — this is a master register update only.
 */

import { useRef, useState } from "react";
import { useParams } from "next/navigation";
import {
  CheckCircle2,
  XCircle,
  Upload,
  FileText,
  AlertTriangle,
  Download,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { validateMSISDN, normaliseMSISDN } from "@/lib/validation";
import { STUDENTS } from "@/lib/mock-data/students";
import Papa from "papaparse";

const V = { red: "#E60000" };

interface MasterRow {
  rowIndex: number;
  name: string;
  msisdn: string;
  raw: string;
  status: "valid" | "invalid_format" | "suspended" | "unknown";
  reason?: string;
}

function classifyMSISDN(
  msisdn: string,
  institutionId: string,
): Pick<MasterRow, "status" | "reason"> {
  if (!validateMSISDN(msisdn)) {
    return {
      status: "invalid_format",
      reason: "Invalid Lesotho MSISDN format",
    };
  }
  const normalised = normaliseMSISDN(msisdn);
  const student = STUDENTS.find(
    (s) =>
      normaliseMSISDN(s.msisdn) === normalised &&
      s.institutionId === institutionId,
  );
  if (student && student.status === "suspended") {
    return { status: "suspended", reason: "Student account is suspended" };
  }
  return { status: "valid" };
}

export default function SpocMasterListPage() {
  const params = useParams<{ institution: string }>();
  const institutionId = params.institution;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [dragOver, setDragOver] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [rows, setRows] = useState<MasterRow[]>([]);
  const [fileName, setFileName] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const valid = rows.filter((r) => r.status === "valid");
  const invalid = rows.filter((r) => r.status !== "valid");

  function processFile(file: File) {
    if (
      !file.name.toLowerCase().endsWith(".csv") &&
      !file.name.toLowerCase().endsWith(".xlsx")
    ) {
      alert("Only .csv and .xlsx files are accepted.");
      return;
    }
    setFileName(file.name);
    setProcessing(true);
    setSubmitted(false);

    if (file.name.toLowerCase().endsWith(".xlsx")) {
      // XLSX — use FileReader + xlsx
      const reader = new FileReader();
      reader.onload = async (e) => {
        const { read, utils } = await import("xlsx");
        const wb = read(e.target?.result, { type: "array" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const json = utils.sheet_to_json<Record<string, string>>(ws, {
          defval: "",
        });
        parseRows(json);
      };
      reader.readAsArrayBuffer(file);
    } else {
      // CSV — use PapaParse
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        const result = Papa.parse<Record<string, string>>(text, {
          header: true,
          skipEmptyLines: true,
          transformHeader: (h) => h.trim().toLowerCase(),
        });
        parseRows(result.data);
      };
      reader.readAsText(file);
    }
  }

  function parseRows(raw: Record<string, string>[]) {
    const parsed: MasterRow[] = raw.map((row, i) => {
      const name = (row["name"] ?? row["Name"] ?? "").trim();
      const msisdn = (
        row["msisdn"] ??
        row["MSISDN"] ??
        row["phone"] ??
        row["Phone"] ??
        ""
      ).trim();
      const { status, reason } = classifyMSISDN(msisdn, institutionId);
      return {
        rowIndex: i + 1,
        name,
        msisdn,
        raw: JSON.stringify(row),
        status,
        reason,
      };
    });
    setRows(parsed);
    setProcessing(false);
  }

  function handleSubmit() {
    if (valid.length === 0) return;
    // In a real system this would POST to an API to persist the master list.
    // Here we just mark it as submitted.
    setSubmitted(true);
  }

  function downloadTemplate() {
    const csv = [
      "name,msisdn",
      "Thabo Molefe,+26657210001",
      "Palesa Mokoena,+26658220002",
      "Kelechi Nwosu,+26659330003",
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "master-list-template.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  function downloadInvalid() {
    const csv = [
      "row,name,msisdn,reason",
      ...invalid.map(
        (r) =>
          `${r.rowIndex},"${r.name}","${r.msisdn}","${r.reason ?? r.status}"`,
      ),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "master-list-invalid.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  const STATUS_STYLE: Record<string, string> = {
    valid: "bg-green-50 text-green-700 border-green-200",
    invalid_format: "bg-red-50 text-red-700 border-red-200",
    suspended: "bg-yellow-50 text-yellow-700 border-yellow-200",
    unknown: "bg-zinc-100 text-zinc-500",
  };
  const STATUS_LABEL: Record<string, string> = {
    valid: "Valid",
    invalid_format: "Invalid MSISDN",
    suspended: "Suspended",
    unknown: "Unknown",
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-zinc-900">
            Upload Master List
          </h1>
          <p className="text-sm text-zinc-500 mt-0.5">
            Upload the full academic-year student register. MSISDNs are
            validated for format and active status.
          </p>
        </div>
        <button
          onClick={downloadTemplate}
          className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-white"
          style={{ backgroundColor: V.red }}
        >
          <Download className="w-3.5 h-3.5" /> Template
        </button>
      </div>

      {/* Drop zone */}
      {rows.length === 0 && (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            const f = e.dataTransfer.files[0];
            if (f) processFile(f);
          }}
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-colors"
          style={{
            borderColor: dragOver ? V.red : "#D1D5DB",
            backgroundColor: dragOver ? "#FFF0F0" : "#FAFAFA",
          }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.xlsx"
            className="sr-only"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) processFile(f);
            }}
          />
          <Upload
            className="w-10 h-10 mx-auto mb-3"
            style={{ color: dragOver ? V.red : "#9CA3AF" }}
          />
          <p className="text-sm font-medium text-zinc-700">
            Drag & drop or click to browse
          </p>
          <p className="text-xs text-zinc-400 mt-1">
            CSV or XLSX · columns: <code>name</code>, <code>msisdn</code>
          </p>
        </div>
      )}

      {processing && (
        <div className="text-center py-8 text-sm text-zinc-500 animate-pulse">
          Validating MSISDNs…
        </div>
      )}

      {/* Results */}
      {rows.length > 0 && !processing && (
        <>
          {/* Summary */}
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-5">
                <p className="text-2xl font-bold text-zinc-900">
                  {rows.length}
                </p>
                <p className="text-xs text-zinc-500 mt-0.5">Total rows</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-5">
                <p className="text-2xl font-bold text-green-600">
                  {valid.length}
                </p>
                <p className="text-xs text-zinc-500 mt-0.5">Valid MSISDNs</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-5">
                <p className="text-2xl font-bold" style={{ color: V.red }}>
                  {invalid.length}
                </p>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Invalid / Suspended
                </p>
              </CardContent>
            </Card>
          </div>

          {submitted ? (
            <Card>
              <CardContent className="py-10 text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 mx-auto text-green-500" />
                <p className="text-base font-semibold text-zinc-900">
                  Master list submitted
                </p>
                <p className="text-sm text-zinc-500">
                  {valid.length} students registered for{" "}
                  {new Date().getFullYear()} academic year.
                </p>
                <button
                  onClick={() => {
                    setRows([]);
                    setFileName("");
                    setSubmitted(false);
                  }}
                  className="mt-4 text-xs font-medium underline"
                  style={{ color: V.red }}
                >
                  Upload another list
                </button>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Table */}
              <Card>
                <CardHeader className="pb-2 flex flex-row items-center justify-between">
                  <CardTitle className="text-sm">{fileName}</CardTitle>
                  {invalid.length > 0 && (
                    <button
                      onClick={downloadInvalid}
                      className="flex items-center gap-1 text-xs font-medium"
                      style={{ color: V.red }}
                    >
                      <Download className="w-3 h-3" /> Download invalid rows
                    </button>
                  )}
                </CardHeader>
                <div className="overflow-x-auto max-h-80 overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead className="sticky top-0 bg-zinc-50">
                      <tr className="border-b">
                        <th className="px-4 py-2 text-left text-xs font-medium text-zinc-500">
                          #
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-zinc-500">
                          Name
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-zinc-500">
                          MSISDN
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-zinc-500">
                          Status
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-zinc-500">
                          Reason
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                      {rows.map((r) => (
                        <tr
                          key={r.rowIndex}
                          className={r.status !== "valid" ? "bg-red-50/30" : ""}
                        >
                          <td className="px-4 py-2 text-xs text-zinc-400">
                            {r.rowIndex}
                          </td>
                          <td className="px-4 py-2 text-zinc-800">
                            {r.name || (
                              <span className="text-zinc-400 italic">—</span>
                            )}
                          </td>
                          <td className="px-4 py-2 font-mono text-xs">
                            {r.msisdn || (
                              <span className="text-zinc-400 italic">—</span>
                            )}
                          </td>
                          <td className="px-4 py-2">
                            <span
                              className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium ${STATUS_STYLE[r.status]}`}
                            >
                              {r.status === "valid" ? (
                                <CheckCircle2 className="w-3 h-3" />
                              ) : (
                                <XCircle className="w-3 h-3" />
                              )}
                              {STATUS_LABEL[r.status]}
                            </span>
                          </td>
                          <td className="px-4 py-2 text-xs text-zinc-400">
                            {r.reason ?? "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>

              {/* Actions */}
              <div className="flex gap-3">
                <Button
                  onClick={handleSubmit}
                  disabled={valid.length === 0}
                  className="text-white gap-2"
                  style={{ backgroundColor: V.red }}
                >
                  <FileText className="w-4 h-4" />
                  Submit {valid.length} valid students
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setRows([]);
                    setFileName("");
                  }}
                >
                  Upload different file
                </Button>
              </div>

              {invalid.length > 0 && (
                <p className="text-xs flex items-center gap-1.5 text-amber-600">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  {invalid.length} row{invalid.length > 1 ? "s" : ""} with
                  invalid or suspended MSISDNs will be excluded from the master
                  list.
                </p>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
