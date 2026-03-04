"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";
import { TableSkeleton } from "@/components/skeletons/TableSkeleton";
import Input from "@/components/shared/Input";
import Button from "@/components/shared/Button";
import { Search, FolderKanban, Trash2, ChevronDown, ExternalLink } from "lucide-react";

interface Project {
  id: string;
  user_id: string;
  name: string;
  address: string | null;
  status: string;
  description: string | null;
  project_type: string | null;
  client_name: string | null;
  permit_type: string | null;
  created_at: string;
  updated_at: string;
  profiles?: { email: string | null; first_name: string | null; last_name: string | null } | null;
  blueprintCount?: number;
}

const statusColors: Record<string, string> = {
  created: "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300",
  processing: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400",
  ready: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400",
  completed: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400",
};

const ALL_STATUSES = ["created", "processing", "ready", "completed"];

export default function ProjectsPage() {
  const { admin, loading } = useAuth();
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [expandedProject, setExpandedProject] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

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
          const { data: bpCounts } = await supabase.from("blueprints").select("project_id");
          const bpMap: Record<string, number> = {};
          for (const bp of bpCounts || []) {
            bpMap[bp.project_id] = (bpMap[bp.project_id] || 0) + 1;
          }
          setProjects(
            (data || []).map((p) => ({ ...p, blueprintCount: bpMap[p.id] || 0 }))
          );
        }
      } catch (err) {
        console.error("Failed to fetch projects:", err);
      } finally {
        setLoadingData(false);
      }
    }

    fetchProjects();
  }, [admin]);

  const handleStatusChange = async (projectId: string, newStatus: string) => {
    try {
      await supabase.from("projects").update({ status: newStatus }).eq("id", projectId);
      setProjects((prev) =>
        prev.map((p) => (p.id === projectId ? { ...p, status: newStatus } : p))
      );
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  const handleDelete = async (projectId: string) => {
    setDeleting(true);
    try {
      await supabase.from("blueprints").delete().eq("project_id", projectId);
      await supabase.from("projects").delete().eq("id", projectId);
      setProjects((prev) => prev.filter((p) => p.id !== projectId));
      setDeleteConfirm(null);
    } catch (err) {
      console.error("Failed to delete project:", err);
    } finally {
      setDeleting(false);
    }
  };

  if (loading || !admin) return <TableSkeleton />;
  if (loadingData) return <TableSkeleton />;

  const filtered = projects.filter((p) => {
    const q = search.toLowerCase();
    const matchesSearch =
      p.name.toLowerCase().includes(q) ||
      (p.address || "").toLowerCase().includes(q) ||
      (p.profiles?.email || "").toLowerCase().includes(q) ||
      (p.client_name || "").toLowerCase().includes(q);
    const matchesStatus = statusFilter === "all" || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statusCounts = projects.reduce((acc, p) => {
    acc[p.status] = (acc[p.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FolderKanban className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Projects</h1>
        </div>
        <span className="text-sm text-gray-500 dark:text-gray-400">{filtered.length} projects</span>
      </div>

      <div className="flex flex-wrap gap-2">
        {["all", ...ALL_STATUSES].map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              statusFilter === status
                ? "bg-primary text-white"
                : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            {status === "all" ? `All (${projects.length})` : `${status} (${statusCounts[status] || 0})`}
          </button>
        ))}
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          type="text"
          placeholder="Search by name, address, owner, or client..."
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
              <th className="text-center px-4 py-3 font-medium text-gray-500 dark:text-gray-400">BPs</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Created</th>
              <th className="text-right px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((project) => (
              <>
                <tr
                  key={project.id}
                  className="border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors cursor-pointer"
                  onClick={() => setExpandedProject(expandedProject === project.id ? null : project.id)}
                >
                  <td className="px-4 py-3">
                    <div className="text-gray-900 dark:text-white font-medium">{project.name}</div>
                    {project.address && <div className="text-xs text-gray-500 dark:text-gray-400">{project.address}</div>}
                  </td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                    {project.profiles?.email || project.user_id.slice(0, 8) + "..."}
                  </td>
                  <td className="px-4 py-3">
                    <select
                      className={`text-xs font-medium rounded px-2 py-0.5 border-none cursor-pointer ${statusColors[project.status] || statusColors.created}`}
                      value={project.status}
                      onChange={(e) => {
                        e.stopPropagation();
                        handleStatusChange(project.id, e.target.value);
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {ALL_STATUSES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-center text-gray-600 dark:text-gray-300">
                    {project.blueprintCount ?? 0}
                  </td>
                  <td className="px-4 py-3 text-gray-500 dark:text-gray-400">
                    {new Date(project.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {deleteConfirm === project.id ? (
                      <div className="flex items-center gap-2 justify-end" onClick={(e) => e.stopPropagation()}>
                        <Button
                          size="sm"
                          variant="danger"
                          isLoading={deleting}
                          onClick={() => handleDelete(project.id)}
                        >
                          Confirm
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setDeleteConfirm(null)}>
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteConfirm(project.id);
                        }}
                        className="p-1.5 rounded-lg text-red-400 hover:bg-red-400/10 transition-colors"
                        title="Delete project"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
                {expandedProject === project.id && (
                  <tr key={`${project.id}-detail`} className="bg-gray-50 dark:bg-gray-800/50">
                    <td colSpan={6} className="px-6 py-4">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500 dark:text-gray-400 block text-xs">Project ID</span>
                          <span className="font-mono text-xs text-gray-700 dark:text-gray-300">{project.id}</span>
                        </div>
                        <div>
                          <span className="text-gray-500 dark:text-gray-400 block text-xs">Type</span>
                          <span className="text-gray-700 dark:text-gray-300">{project.project_type || "—"}</span>
                        </div>
                        <div>
                          <span className="text-gray-500 dark:text-gray-400 block text-xs">Client</span>
                          <span className="text-gray-700 dark:text-gray-300">{project.client_name || "—"}</span>
                        </div>
                        <div>
                          <span className="text-gray-500 dark:text-gray-400 block text-xs">Permit Type</span>
                          <span className="text-gray-700 dark:text-gray-300">{project.permit_type || "—"}</span>
                        </div>
                        <div className="col-span-2">
                          <span className="text-gray-500 dark:text-gray-400 block text-xs">Description</span>
                          <span className="text-gray-700 dark:text-gray-300">{project.description || "—"}</span>
                        </div>
                        <div>
                          <span className="text-gray-500 dark:text-gray-400 block text-xs">Updated</span>
                          <span className="text-gray-700 dark:text-gray-300">
                            {new Date(project.updated_at).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
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
