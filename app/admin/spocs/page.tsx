"use client";

import { useEffect, useState, useMemo } from "react";
import { toast } from "sonner";
import { UserPlus, Trash2, Search } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { User } from "@/lib/types";

const V = { red: "#E60000" };

const INSTITUTIONS = [
  { id: "nul", name: "National University of Lesotho" },
  { id: "limkokwing", name: "Limkokwing University" },
  { id: "botho", name: "Botho University" },
  { id: "lerotholi", name: "Lerotholi Polytechnic" },
  { id: "qoaling", name: "Qoaling High School" },
  { id: "abia", name: "Abia High School" },
  { id: "little-darlings", name: "Little Darlings" },
  { id: "tholoana", name: "Tholoana ea Bopheho" },
];

interface NewSpocForm {
  name: string;
  email: string;
  password: string;
  institutionId: string;
}

export default function AdminSPOCsPage() {
  const [spocs, setSpocs] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<NewSpocForm>({
    name: "",
    email: "",
    password: "",
    institutionId: "nul",
  });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    import("@/lib/mock-data/users").then(({ USERS }) =>
      setSpocs(USERS.filter((u) => u.role === "spoc")),
    );
  }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return spocs;
    const q = search.toLowerCase();
    return spocs.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.institutionId.toLowerCase().includes(q),
    );
  }, [spocs, search]);

  function handleRemove(id: string) {
    setSpocs((prev) => prev.filter((u) => u.id !== id));
    toast.success("SPOC removed successfully");
  }

  function handleDeactivate(id: string) {
    setSpocs((prev) =>
      prev.map((u) => (u.id === id ? { ...u, active: !u.active } : u)),
    );
    const spoc = spocs.find((u) => u.id === id);
    toast.success(`SPOC ${spoc?.active ? "deactivated" : "activated"}`);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) {
      toast.error("All fields are required");
      return;
    }
    if (spocs.some((u) => u.email.toLowerCase() === form.email.toLowerCase())) {
      toast.error("A SPOC with this email already exists");
      return;
    }
    setCreating(true);
    await new Promise((r) => setTimeout(r, 500));

    const newSpoc: User = {
      id: `user-${form.institutionId}-spoc-${Date.now()}`,
      email: form.email,
      passwordHash: form.password,
      name: form.name,
      role: "spoc",
      institutionId: form.institutionId,
      active: true,
      createdAt: new Date().toISOString(),
    };
    setSpocs((prev) => [newSpoc, ...prev]);
    setForm({ name: "", email: "", password: "", institutionId: "nul" });
    setShowForm(false);
    setCreating(false);
    toast.success(`SPOC ${form.name} created successfully`);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-zinc-900">SPOCs</h1>
          <p className="text-sm text-zinc-500">
            {filtered.length} of {spocs.length} school points of contact
          </p>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="gap-2 text-white text-sm"
          style={{ backgroundColor: V.red }}
        >
          <UserPlus className="w-4 h-4" />
          {showForm ? "Cancel" : "Add SPOC"}
        </Button>
      </div>

      {/* Create SPOC form */}
      {showForm && (
        <Card>
          <form onSubmit={handleCreate} className="p-6 space-y-4">
            <h2 className="text-sm font-semibold text-zinc-900">
              New SPOC Account
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="spoc-name">Full Name</Label>
                <Input
                  id="spoc-name"
                  placeholder="e.g. Mpho Dlamini"
                  value={form.name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, name: e.target.value }))
                  }
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="spoc-email">Email Address</Label>
                <Input
                  id="spoc-email"
                  type="email"
                  placeholder="spoc@institution.ac.ls"
                  value={form.email}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, email: e.target.value }))
                  }
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="spoc-password">Temporary Password</Label>
                <Input
                  id="spoc-password"
                  type="password"
                  placeholder="min. 8 characters"
                  value={form.password}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, password: e.target.value }))
                  }
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="spoc-institution">Institution</Label>
                <select
                  id="spoc-institution"
                  value={form.institutionId}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, institutionId: e.target.value }))
                  }
                  className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm focus:outline-none focus:ring-2"
                  style={{ "--tw-ring-color": V.red } as React.CSSProperties}
                >
                  {INSTITUTIONS.map((i) => (
                    <option key={i.id} value={i.id}>
                      {i.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-3">
              <Button
                type="submit"
                disabled={creating}
                className="text-white gap-2"
                style={{ backgroundColor: V.red }}
              >
                <UserPlus className="w-4 h-4" />
                {creating ? "Creating…" : "Create SPOC"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
        <Input
          placeholder="Search by name, email or institution…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-zinc-50">
                {[
                  "Name",
                  "Email",
                  "Institution",
                  "Status",
                  "Last Login",
                  "Actions",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-xs font-medium text-zinc-500"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-10 text-center text-zinc-400 text-sm"
                  >
                    No SPOCs found.
                  </td>
                </tr>
              ) : (
                filtered.map((u) => (
                  <tr key={u.id} className="border-b hover:bg-zinc-50">
                    <td className="px-4 py-3 font-medium text-zinc-900">
                      {u.name}
                    </td>
                    <td className="px-4 py-3 text-zinc-600 text-xs">
                      {u.email}
                    </td>
                    <td className="px-4 py-3 text-zinc-600 text-xs">
                      {u.institutionId}
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        className={
                          u.active
                            ? "bg-green-100 text-green-700 border-green-200"
                            : "bg-zinc-100 text-zinc-500"
                        }
                      >
                        {u.active ? "Active" : "Inactive"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-xs text-zinc-400">
                      {u.lastLoginAt
                        ? new Date(u.lastLoginAt).toLocaleDateString()
                        : "Never"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleDeactivate(u.id)}
                          className="text-xs px-2 py-1 rounded border transition-colors hover:bg-zinc-50"
                          style={{
                            borderColor: "#E0E0E0",
                            color: u.active ? "#888" : V.red,
                          }}
                        >
                          {u.active ? "Deactivate" : "Activate"}
                        </button>
                        <button
                          onClick={() => handleRemove(u.id)}
                          className="p-1 rounded hover:bg-red-50 transition-colors"
                          title="Remove SPOC"
                          style={{ color: V.red }}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
