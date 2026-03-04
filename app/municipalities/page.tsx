"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";
import { TableSkeleton } from "@/components/skeletons/TableSkeleton";
import Input from "@/components/shared/Input";
import Button from "@/components/shared/Button";
import { Search, Building2, CheckCircle, XCircle, Plus, X, Edit2 } from "lucide-react";

interface Municipality {
  id: string;
  name: string;
  slug: string;
  county: string;
  state: string;
  is_active: boolean;
  approved: boolean;
  website_url: string | null;
  permit_form_template: string | null;
}

const emptyForm = { name: "", slug: "", county: "", state: "", website_url: "", permit_form_template: "" };

export default function MunicipalitiesPage() {
  const { admin, loading } = useAuth();
  const router = useRouter();
  const [municipalities, setMunicipalities] = useState<Municipality[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    if (!loading && !admin) router.push("/login");
  }, [admin, loading, router]);

  const fetchMunicipalities = async () => {
    try {
      const { data, error } = await supabase
        .from("municipalities")
        .select("id, name, slug, county, state, is_active, approved, website_url, permit_form_template")
        .order("name", { ascending: true });

      if (error) throw error;
      setMunicipalities(data || []);
    } catch (err) {
      console.error("Failed to fetch municipalities:", err);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    if (!admin) return;
    fetchMunicipalities();
  }, [admin]);

  const toggleApproved = async (id: string, currentValue: boolean) => {
    try {
      await supabase.from("municipalities").update({ approved: !currentValue }).eq("id", id);
      setMunicipalities((prev) =>
        prev.map((m) => (m.id === id ? { ...m, approved: !currentValue } : m))
      );
    } catch (err) {
      console.error("Failed to toggle approved:", err);
    }
  };

  const toggleActive = async (id: string, currentValue: boolean) => {
    try {
      await supabase.from("municipalities").update({ is_active: !currentValue }).eq("id", id);
      setMunicipalities((prev) =>
        prev.map((m) => (m.id === id ? { ...m, is_active: !currentValue } : m))
      );
    } catch (err) {
      console.error("Failed to toggle active:", err);
    }
  };

  const openEditForm = (m: Municipality) => {
    setEditingId(m.id);
    setForm({
      name: m.name,
      slug: m.slug || "",
      county: m.county,
      state: m.state,
      website_url: m.website_url || "",
      permit_form_template: m.permit_form_template || "",
    });
    setShowForm(true);
    setFormError("");
  };

  const openNewForm = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
    setFormError("");
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    if (!form.name || !form.county || !form.state) {
      setFormError("Name, County, and State are required.");
      return;
    }
    setSaving(true);

    try {
      const slug = form.slug || form.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
      const payload = {
        name: form.name,
        slug,
        county: form.county,
        state: form.state,
        website_url: form.website_url || null,
        permit_form_template: form.permit_form_template || null,
      };

      if (editingId) {
        await supabase.from("municipalities").update(payload).eq("id", editingId);
      } else {
        await supabase.from("municipalities").insert(payload);
      }

      setShowForm(false);
      setForm(emptyForm);
      setEditingId(null);
      await fetchMunicipalities();
    } catch (err: any) {
      setFormError(err.message || "Failed to save.");
    } finally {
      setSaving(false);
    }
  };

  if (loading || !admin) return <TableSkeleton />;
  if (loadingData) return <TableSkeleton />;

  const filtered = municipalities.filter((m) => {
    const q = search.toLowerCase();
    return m.name.toLowerCase().includes(q) || m.county.toLowerCase().includes(q) || m.state.toLowerCase().includes(q);
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Building2 className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Municipalities</h1>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500 dark:text-gray-400">{filtered.length} municipalities</span>
          <Button size="sm" icon={<Plus className="w-4 h-4" />} onClick={openNewForm}>
            Add
          </Button>
        </div>
      </div>

      {showForm && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">
              {editingId ? "Edit Municipality" : "Add Municipality"}
            </h2>
            <button onClick={() => { setShowForm(false); setEditingId(null); }} className="text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </div>
          {formError && (
            <div className="mb-4 p-3 bg-red-400/20 border border-red-400/50 rounded-lg text-red-400 text-sm">
              {formError}
            </div>
          )}
          <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Name"
              value={form.name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, name: e.target.value })}
              required
              placeholder="City of Miami"
            />
            <Input
              label="Slug"
              value={form.slug}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, slug: e.target.value })}
              placeholder="city-of-miami (auto-generated if empty)"
            />
            <Input
              label="County"
              value={form.county}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, county: e.target.value })}
              required
              placeholder="Miami-Dade"
            />
            <Input
              label="State"
              value={form.state}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, state: e.target.value })}
              required
              placeholder="FL"
            />
            <Input
              label="Website URL"
              type="url"
              value={form.website_url}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, website_url: e.target.value })}
              placeholder="https://..."
            />
            <Input
              label="Permit Form Template"
              value={form.permit_form_template}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, permit_form_template: e.target.value })}
              placeholder="Template name or ID"
            />
            <div className="md:col-span-2 flex justify-end gap-3">
              <Button type="button" variant="ghost" onClick={() => { setShowForm(false); setEditingId(null); }}>
                Cancel
              </Button>
              <Button type="submit" isLoading={saving}>
                {editingId ? "Update" : "Create"}
              </Button>
            </div>
          </form>
        </div>
      )}

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          type="text"
          placeholder="Search by name, county, or state..."
          value={search}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
              <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Name</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">County</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">State</th>
              <th className="text-center px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Approved</th>
              <th className="text-center px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Active</th>
              <th className="text-right px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((m) => (
              <tr key={m.id} className="border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                <td className="px-4 py-3">
                  <div className="text-gray-900 dark:text-white font-medium">{m.name}</div>
                  {m.website_url && (
                    <a
                      href={m.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary hover:underline"
                    >
                      {m.website_url}
                    </a>
                  )}
                </td>
                <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{m.county}</td>
                <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{m.state}</td>
                <td className="px-4 py-3 text-center">
                  <button onClick={() => toggleApproved(m.id, m.approved)} className="transition-colors" title={m.approved ? "Unapprove" : "Approve"}>
                    {m.approved ? (
                      <CheckCircle className="w-5 h-5 text-green-500 mx-auto" />
                    ) : (
                      <XCircle className="w-5 h-5 text-gray-300 dark:text-gray-600 mx-auto" />
                    )}
                  </button>
                </td>
                <td className="px-4 py-3 text-center">
                  <button onClick={() => toggleActive(m.id, m.is_active)} className="transition-colors" title={m.is_active ? "Deactivate" : "Activate"}>
                    {m.is_active ? (
                      <CheckCircle className="w-5 h-5 text-green-500 mx-auto" />
                    ) : (
                      <XCircle className="w-5 h-5 text-gray-300 dark:text-gray-600 mx-auto" />
                    )}
                  </button>
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => openEditForm(m)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-primary hover:bg-primary/10 transition-colors"
                    title="Edit"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                  {search ? "No municipalities match your search." : "No municipalities found."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
