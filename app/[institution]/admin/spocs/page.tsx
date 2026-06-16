"use client";

/**
 * Admin SPOCs page
 *
 * Lists SPOC users with active/inactive status.
 * Deactivate button per SPOC. Create SPOC form (name, email, password).
 *
 * Requirements: 13.5
 */

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { UserCog, UserX, UserPlus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { USERS } from "@/lib/mock-data/users";
import type { User } from "@/lib/types";

type SpocState = User & { deactivated?: boolean };

export default function AdminSpocsPage() {
  const initialSpocs = useMemo(
    () => USERS.filter((u) => u.role === "spoc").map((u) => ({ ...u })),
    [],
  );
  const [spocs, setSpocs] = useState<SpocState[]>(initialSpocs);

  // Create SPOC form state
  const [showForm, setShowForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [creating, setCreating] = useState(false);

  const handleDeactivate = (id: string) => {
    setSpocs((prev) =>
      prev.map((s) => (s.id === id ? { ...s, active: false } : s)),
    );
    toast.success("SPOC deactivated.");
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newEmail.trim() || !newPassword.trim()) {
      toast.error("All fields are required.");
      return;
    }
    setCreating(true);
    // Simulate async creation
    await new Promise((r) => setTimeout(r, 400));
    const newSpoc: SpocState = {
      id: `user-spoc-${Date.now()}`,
      email: newEmail,
      passwordHash: newPassword,
      name: newName,
      role: "spoc",
      institutionId: "unknown",
      active: true,
      createdAt: new Date().toISOString(),
    };
    setSpocs((prev) => [...prev, newSpoc]);
    toast.success(`SPOC "${newName}" created.`);
    setNewName("");
    setNewEmail("");
    setNewPassword("");
    setShowForm(false);
    setCreating(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-zinc-900">
            SPOC Management
          </h1>
          <p className="text-sm text-zinc-500 mt-0.5">
            {spocs.length} SPOC{spocs.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button size="sm" onClick={() => setShowForm((v) => !v)}>
          <UserPlus className="w-4 h-4 mr-2" />
          {showForm ? "Cancel" : "Create SPOC"}
        </Button>
      </div>

      {/* Create SPOC form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">New SPOC</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="space-y-3 max-w-sm">
              <div className="space-y-1">
                <Label htmlFor="spoc-name">Full name</Label>
                <Input
                  id="spoc-name"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Jane Doe"
                  required
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="spoc-email">Email</Label>
                <Input
                  id="spoc-email"
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="jane@institution.ac.ls"
                  required
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="spoc-password">Password</Label>
                <Input
                  id="spoc-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>
              <Button type="submit" size="sm" disabled={creating}>
                {creating ? "Creating…" : "Create SPOC"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* SPOC list */}
      <div className="grid gap-3">
        {spocs.length === 0 ? (
          <div className="text-center text-zinc-400 py-12">No SPOCs found</div>
        ) : (
          spocs.map((spoc) => (
            <div
              key={spoc.id}
              className="flex items-center justify-between bg-white rounded-lg border border-zinc-200 px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-zinc-100 flex items-center justify-center shrink-0">
                  <UserCog className="w-4 h-4 text-zinc-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-zinc-900">
                    {spoc.name}
                  </p>
                  <p className="text-xs text-zinc-500">{spoc.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Badge variant={spoc.active ? "default" : "outline"}>
                  {spoc.active ? "Active" : "Inactive"}
                </Badge>
                {spoc.active && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeactivate(spoc.id)}
                    className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
                  >
                    <UserX className="w-3.5 h-3.5 mr-1.5" />
                    Deactivate
                  </Button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
