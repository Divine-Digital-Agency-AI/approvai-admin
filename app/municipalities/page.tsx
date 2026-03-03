"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";
import { TableSkeleton } from "@/components/skeletons/TableSkeleton";
import Input from "@/components/shared/Input";
import { Search, Building2, CheckCircle, XCircle } from "lucide-react";

interface Municipality {
  id: string;
  name: string;
  county: string;
  state: string;
  is_active: boolean;
  approved: boolean;
  website_url: string | null;
}

export default function MunicipalitiesPage() {
  const { admin, loading } = useAuth();
  const router = useRouter();
  const [municipalities, setMunicipalities] = useState<Municipality[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!loading && !admin) router.push("/login");
  }, [admin, loading, router]);

  useEffect(() => {
    if (!admin) return;

    async function fetchMunicipalities() {
      try {
        const { data, error } = await supabase
          .from("municipalities")
          .select("id, name, county, state, is_active, approved, website_url")
          .order("name", { ascending: true });

        if (error) throw error;
        setMunicipalities(data || []);
      } catch (err) {
        console.error("Failed to fetch municipalities:", err);
      } finally {
        setLoadingData(false);
      }
    }

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
        <span className="text-sm text-gray-500 dark:text-gray-400">{filtered.length} municipalities</span>
      </div>

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
            </tr>
          </thead>
          <tbody>
            {filtered.map((m) => (
              <tr key={m.id} className="border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                <td className="px-4 py-3 text-gray-900 dark:text-white font-medium">{m.name}</td>
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
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
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
