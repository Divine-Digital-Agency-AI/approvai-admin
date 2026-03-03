"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";
import { TableSkeleton } from "@/components/skeletons/TableSkeleton";
import Input from "@/components/shared/Input";
import { Search, FolderKanban } from "lucide-react";

interface Project {
  id: string;
  user_id: string;
  name: string;
  address: string | null;
  status: string;
  created_at: string;
  profiles?: { email: string | null; first_name: string | null; last_name: string | null } | null;
}

const statusColors: Record<string, string> = {
  created: "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300",
  processing: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400",
  ready: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400",
  completed: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400",
};

export default function ProjectsPage() {
  const { admin, loading } = useAuth();
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!loading && !admin) router.push("/login");
  }, [admin, loading, router]);

  useEffect(() => {
    if (!admin) return;

    async function fetchProjects() {
      try {
        const { data, error } = await supabase
          .from("projects")
          .select("*, profiles!projects_user_id_fkey(email, first_name, last_name)")
          .order("created_at", { ascending: false });

        if (error) {
          const { data: fallback, error: fallbackError } = await supabase
            .from("projects")
            .select("*")
            .order("created_at", { ascending: false });

          if (fallbackError) throw fallbackError;
          setProjects(fallback || []);
        } else {
          setProjects(data || []);
        }
      } catch (err) {
        console.error("Failed to fetch projects:", err);
      } finally {
        setLoadingData(false);
      }
    }

    fetchProjects();
  }, [admin]);

  if (loading || !admin) return <TableSkeleton />;
  if (loadingData) return <TableSkeleton />;

  const filtered = projects.filter((p) => {
    const q = search.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      (p.address || "").toLowerCase().includes(q) ||
      (p.profiles?.email || "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FolderKanban className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Projects</h1>
        </div>
        <span className="text-sm text-gray-500 dark:text-gray-400">{filtered.length} projects</span>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          type="text"
          placeholder="Search by name, address, or owner..."
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
              <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Owner</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Status</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Created</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((project) => (
              <tr key={project.id} className="border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                <td className="px-4 py-3">
                  <div className="text-gray-900 dark:text-white font-medium">{project.name}</div>
                  {project.address && <div className="text-xs text-gray-500 dark:text-gray-400">{project.address}</div>}
                </td>
                <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                  {project.profiles?.email || project.user_id.slice(0, 8) + "..."}
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${statusColors[project.status] || statusColors.created}`}>
                    {project.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-500 dark:text-gray-400">
                  {new Date(project.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                  {search ? "No projects match your search." : "No projects found."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
