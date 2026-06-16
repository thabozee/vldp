"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Institution } from "@/lib/types";

const V = { red: "#E60000" };

export default function AdminInstitutionsPage() {
  const [institutions, setInstitutions] = useState<Institution[]>([]);

  useEffect(() => {
    import("@/lib/mock-data/institutions").then(({ INSTITUTIONS }) =>
      setInstitutions(INSTITUTIONS),
    );
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-zinc-900">Institutions</h1>
        <p className="text-sm text-zinc-500">
          All registered institutions ({institutions.length})
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {institutions.map((inst) => (
          <Card key={inst.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold"
                  style={{ backgroundColor: inst.primaryColor }}
                >
                  {inst.shortName.slice(0, 2)}
                </div>
                <div>
                  <CardTitle className="text-sm">{inst.name}</CardTitle>
                  <p className="text-xs text-zinc-400">{inst.shortName}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-2 text-xs text-zinc-500">
              <div className="flex items-center justify-between">
                <span>Type</span>
                <Badge variant="outline" className="capitalize text-xs">
                  {inst.type}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Status</span>
                <Badge
                  className={
                    inst.active
                      ? "bg-green-100 text-green-700 border-green-200"
                      : "bg-zinc-100 text-zinc-500"
                  }
                >
                  {inst.active ? "Active" : "Inactive"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Merchant MSISDN</span>
                <span className="font-mono">{inst.merchantMSISDN}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>SPOC Portal</span>
                <a
                  href={`/${inst.id}/spoc`}
                  target="_blank"
                  className="text-xs font-medium hover:underline"
                  style={{ color: V.red }}
                >
                  /{inst.id}/spoc ↗
                </a>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
