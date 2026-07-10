"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import AdminSidebar from "../AdminSidebar";

type Plan = {
  id: string;
  key: string;
  name: string;
  isActive: boolean;
  isDefault: boolean;
  assignedUsers?: number;
  features: {
    canEditProfile?: boolean;
    maxLinks?: number | null;
    allowDuplicateType?: boolean;
    blockedSections?: string[];
    showLolyLogo?: boolean;
  };
};

type PlanForm = {
  key: string;
  name: string;
  isActive: boolean;
  isDefault: boolean;
  canEditProfile: boolean;
  maxLinks: string;
  allowDuplicateType: boolean;
  blockedSections: string[];
  showLolyLogo: boolean;
};

const sections = ["contact", "social", "payment", "video", "music", "design", "gaming", "other"];

const emptyForm = (): PlanForm => ({
  key: "",
  name: "",
  isActive: true,
  isDefault: false,
  canEditProfile: true,
  maxLinks: "",
  allowDuplicateType: false,
  blockedSections: [],
  showLolyLogo: true,
});

export default function AdminPlansPage() {
  const router = useRouter();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [form, setForm] = useState<PlanForm>(emptyForm());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const getHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem("admin-token")}` });

  async function loadPlans() {
    const response = await api.get("/admin/plans", { headers: getHeaders() });
    setPlans(response.data.plans || []);
  }

  useEffect(() => {
    const token = localStorage.getItem("admin-token");
    if (!token) {
      router.replace("/login");
      return;
    }

    loadPlans()
      .catch(() => router.replace("/login"))
      .finally(() => setLoading(false));
  }, [router]);

  function editPlan(plan: Plan) {
    setEditingId(plan.id);
    setError("");
    setForm({
      key: plan.key,
      name: plan.name,
      isActive: plan.isActive,
      isDefault: plan.isDefault,
      canEditProfile: plan.features.canEditProfile !== false,
      maxLinks: typeof plan.features.maxLinks === "number" ? String(plan.features.maxLinks) : "",
      allowDuplicateType: plan.features.allowDuplicateType === true,
      blockedSections: plan.features.blockedSections || [],
      showLolyLogo: plan.features.showLolyLogo !== false,
    });
  }

  function resetForm() {
    setEditingId(null);
    setError("");
    setForm(emptyForm());
  }

  function toggleBlockedSection(section: string) {
    setForm((current) => ({
      ...current,
      blockedSections: current.blockedSections.includes(section)
        ? current.blockedSections.filter((item) => item !== section)
        : [...current.blockedSections, section],
    }));
  }

  async function savePlan(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError("");

    const payload = {
      ...(editingId ? {} : { key: form.key.trim().toLowerCase() }),
      name: form.name.trim(),
      isActive: form.isActive,
      isDefault: form.isDefault,
      features: {
        canEditProfile: form.canEditProfile,
        maxLinks: form.maxLinks.trim() === "" ? null : Number(form.maxLinks),
        allowDuplicateType: form.allowDuplicateType,
        blockedSections: form.blockedSections,
        showLolyLogo: form.showLolyLogo,
      },
    };

    try {
      if (editingId) {
        await api.put(`/admin/plans/${editingId}`, payload, { headers: getHeaders() });
      } else {
        await api.post("/admin/plans", payload, { headers: getHeaders() });
      }
      await loadPlans();
      resetForm();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Could not save the plan");
    } finally {
      setSaving(false);
    }
  }

  async function deletePlan(plan: Plan) {
    if (!confirm(`Delete ${plan.name}?`)) return;
    setError("");
    try {
      await api.delete(`/admin/plans/${plan.id}`, { headers: getHeaders() });
      await loadPlans();
      if (editingId === plan.id) resetForm();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Could not delete the plan");
    }
  }

  if (loading) return <p className="mt-20 text-center">Loading plans...</p>;

  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar />

      <main className="flex-1 p-6">
        <div className="mx-auto max-w-6xl space-y-6">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-bold">Subscription Plans</h1>
              <p className="text-sm text-gray-500">Create plans and control profile features without editing JSON.</p>
            </div>
            {editingId && <button onClick={resetForm} className="rounded border px-4 py-2">Create another plan</button>}
          </div>

          {error && <div className="rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

          <div className="overflow-x-auto rounded-lg bg-white shadow">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b text-gray-600">
                  <th className="p-3">Plan</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Users</th>
                  <th className="p-3">Limits</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {plans.map((plan) => (
                  <tr key={plan.id} className="border-b last:border-0">
                    <td className="p-3">
                      <div className="font-semibold">{plan.name}</div>
                      <div className="text-xs text-gray-500">{plan.key}{plan.isDefault ? " - Default" : ""}</div>
                    </td>
                    <td className="p-3">
                      <span className={plan.isActive ? "text-green-700" : "text-gray-500"}>{plan.isActive ? "Active" : "Inactive"}</span>
                    </td>
                    <td className="p-3">{plan.assignedUsers ?? 0}</td>
                    <td className="p-3 text-gray-600">
                      {typeof plan.features.maxLinks === "number" ? `${plan.features.maxLinks} links` : "Unlimited links"}
                    </td>
                    <td className="p-3 text-right space-x-2">
                      <button onClick={() => editPlan(plan)} className="rounded bg-blue-600 px-3 py-1 text-white">Edit</button>
                      <button onClick={() => deletePlan(plan)} disabled={plan.isDefault} className="rounded bg-red-600 px-3 py-1 text-white disabled:cursor-not-allowed disabled:opacity-40">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {plans.length === 0 && <p className="p-5 text-center text-gray-500">No plans found.</p>}
          </div>

          <form onSubmit={savePlan} className="space-y-5 rounded-lg bg-white p-6 shadow">
            <div>
              <h2 className="text-xl font-semibold">{editingId ? "Edit plan" : "Create plan"}</h2>
              <p className="mt-1 text-sm text-gray-500">The key is permanent and cannot be changed after creation.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="text-sm font-medium">
                Plan name
                <input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} className="mt-1 w-full rounded border px-3 py-2 font-normal" />
              </label>
              <label className="text-sm font-medium">
                Plan key
                <input required disabled={Boolean(editingId)} value={form.key} onChange={(event) => setForm({ ...form, key: event.target.value })} placeholder="starter" className="mt-1 w-full rounded border px-3 py-2 font-normal disabled:bg-gray-100" />
              </label>
              <label className="text-sm font-medium">
                Maximum links
                <input type="number" min="0" value={form.maxLinks} onChange={(event) => setForm({ ...form, maxLinks: event.target.value })} placeholder="Leave empty for unlimited" className="mt-1 w-full rounded border px-3 py-2 font-normal" />
              </label>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.isActive} onChange={(event) => setForm({ ...form, isActive: event.target.checked })} /> Active plan</label>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.isDefault} onChange={(event) => setForm({ ...form, isDefault: event.target.checked })} /> Default for new users</label>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.canEditProfile} onChange={(event) => setForm({ ...form, canEditProfile: event.target.checked })} /> Allow profile editing</label>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.allowDuplicateType} onChange={(event) => setForm({ ...form, allowDuplicateType: event.target.checked })} /> Allow duplicate link types</label>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.showLolyLogo} onChange={(event) => setForm({ ...form, showLolyLogo: event.target.checked })} /> Show Loly logo on public QR pages</label>
            </div>

            <div>
              <p className="text-sm font-medium">Blocked profile sections</p>
              <div className="mt-2 flex flex-wrap gap-3">
                {sections.map((section) => (
                  <label key={section} className="flex items-center gap-2 text-sm capitalize">
                    <input type="checkbox" checked={form.blockedSections.includes(section)} onChange={() => toggleBlockedSection(section)} />
                    {section}
                  </label>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button disabled={saving} className="rounded bg-green-600 px-5 py-2 font-medium text-white disabled:opacity-50">{saving ? "Saving..." : editingId ? "Save changes" : "Create plan"}</button>
              <button type="button" onClick={resetForm} className="rounded border px-5 py-2">Cancel</button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
