"use client";

import { Fragment, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { adminFetch } from "@/lib/admin-api";
import { TableSkeleton } from "@/components/skeletons/TableSkeleton";
import Input from "@/components/shared/Input";
import Button from "@/components/shared/Button";
import ConfirmModal from "@/components/shared/ConfirmModal";
import Pagination, { usePagination } from "@/components/shared/Pagination";
import { Search, FileSearch, AlertTriangle, ChevronDown, RotateCcw, Trash2 } from "lucide-react";

interface Blueprint {
  id: string;
  project_id: string;
  file_name: string;
  file_size: number;
  status: string;
  processing_error: string | null;
  page_count: number | null;
  created_at: string;
}

interface ExtractionDetail {
  id: string;
  extraction_method: string;
  ai_model_used: string;
  overall_confidence: number;
  extracted_at: string;
  fields: { field_category: string; field_name: string; field_value: string | null; confidence: number }[];
}

const statusColors: Record<string, string> = {
  uploaded: "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300",
  classifying: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400",
  extracting: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400",
  processed: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400",
  error: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400",
};

export default function BlueprintsPage() {
  const { admin, loading } = useAuth();
  const router = useRouter();
  const [blueprints, setBlueprints] = useState<Blueprint[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [expandedBp, setExpandedBp] = useState<string | null>(null);
  const [extractionDetail, setExtractionDetail] = useState<ExtractionDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Blueprint | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [actionError, setActionError] = useState("");

  useEffect(() => {
    if (!loading && !admin) router.push("/login");
  }, [admin, loading, router]);

  useEffect(() => {
    if (!admin) return;

    async function fetchBlueprints() {
      try {
        setActionError("");
        const res = await adminFetch("/api/admin/blueprints");
        const payload = (await res.json()) as { blueprints?: Blueprint[]; error?: string };
        if (!res.ok) throw new Error(payload.error || "Failed to fetch blueprints.");
        setBlueprints(payload.blueprints || []);
      } catch (err) {
        console.error("Failed to fetch blueprints:", err);
        setActionError(err instanceof Error ? err.message : "Failed to fetch blueprints.");
      } finally {
        setLoadingData(false);
      }
    }

    fetchBlueprints();
  }, [admin]);

  const handleExpand = async (bpId: string) => {
    if (expandedBp === bpId) {
      setExpandedBp(null);
      setExtractionDetail(null);
      return;
    }
    setExpandedBp(bpId);
    setLoadingDetail(true);

    try {
      const res = await adminFetch(`/api/admin/blueprints?blueprintId=${encodeURIComponent(bpId)}`);
      const payload = (await res.json()) as {
        extraction?: ExtractionDetail | null;
        error?: string;
      };
      if (!res.ok) throw new Error(payload.error || "Failed to fetch extraction details.");
      setExtractionDetail(payload.extraction ?? null);
    } catch (err) {
      console.error("Failed to fetch extraction details:", err);
      setActionError(err instanceof Error ? err.message : "Failed to fetch extraction details.");
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleResetStatus = async (bpId: string) => {
    try {
      setActionError("");
      const res = await adminFetch("/api/admin/blueprints", {
        method: "PATCH",
        body: JSON.stringify({ blueprintId: bpId, action: "reset" }),
      });
      const payload = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(payload.error || "Failed to reset status.");
      setBlueprints((prev) =>
        prev.map((b) =>
          b.id === bpId ? { ...b, status: "uploaded", processing_error: null } : b
        )
      );
    } catch (err) {
      console.error("Failed to reset status:", err);
      setActionError(err instanceof Error ? err.message : "Failed to reset status.");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      setActionError("");
      const res = await adminFetch("/api/admin/blueprints", {
        method: "DELETE",
        body: JSON.stringify({ blueprintId: deleteTarget.id }),
      });
      const payload = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(payload.error || "Failed to delete blueprint.");
      setBlueprints((prev) => prev.filter((b) => b.id !== deleteTarget.id));
      if (expandedBp === deleteTarget.id) {
        setExpandedBp(null);
        setExtractionDetail(null);
      }
      setDeleteTarget(null);
    } catch (err) {
      console.error("Failed to delete blueprint:", err);
      setActionError(err instanceof Error ? err.message : "Failed to delete blueprint.");
    } finally {
      setDeleting(false);
    }
  };

  const filtered = blueprints.filter((b) => {
    const matchesSearch = b.file_name.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const { currentPage, setCurrentPage, paginatedItems, totalItems, pageSize } = usePagination(filtered);

  if (loading || !admin) return <TableSkeleton />;
  if (loadingData) return <TableSkeleton />;

  const statusCounts = blueprints.reduce((acc, b) => {
    acc[b.status] = (acc[b.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FileSearch className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Blueprints</h1>
        </div>
        <span className="text-sm text-gray-500 dark:text-gray-400">{filtered.length} blueprints</span>
      </div>

      {actionError && (
        <div className="p-3 bg-red-400/20 border border-red-400/50 rounded-lg text-red-400 text-sm">
          {actionError}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {["all", "uploaded", "classifying", "extracting", "processed", "error"].map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              statusFilter === status
                ? "bg-primary text-white"
                : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            {status === "all" ? `All (${blueprints.length})` : `${status} (${statusCounts[status] || 0})`}
          </button>
        ))}
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          type="text"
          placeholder="Search by file name..."
          value={search}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
              <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">File</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Status</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Pages</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Size</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Created</th>
              <th className="text-right px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedItems.map((bp) => (
              <Fragment key={bp.id}>
                <tr
                  className="border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors cursor-pointer"
                  onClick={() => handleExpand(bp.id)}
                >
                  <td className="px-4 py-3 text-gray-900 dark:text-white font-medium max-w-[200px] truncate">
                    {bp.file_name}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${statusColors[bp.status] || statusColors.uploaded}`}>
                      {bp.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{bp.page_count ?? "—"}</td>
                  <td className="px-4 py-3 text-gray-500 dark:text-gray-400">
                    {bp.file_size ? `${(bp.file_size / 1024).toFixed(0)} KB` : "—"}
                  </td>
                  <td className="px-4 py-3 text-gray-500 dark:text-gray-400">
                    {new Date(bp.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {bp.status === "error" && (
                        <button
                          onClick={(e) => { e.stopPropagation(); handleResetStatus(bp.id); }}
                          className="p-1.5 rounded-lg text-amber-500 hover:bg-amber-400/10 transition-colors"
                          title="Reset to uploaded"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={(e) => { e.stopPropagation(); setDeleteTarget(bp); }}
                        className="p-1.5 rounded-lg text-red-400 hover:bg-red-400/10 transition-colors"
                        title="Delete blueprint"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <ChevronDown
                        className={`w-4 h-4 text-gray-400 transition-transform ${expandedBp === bp.id ? "rotate-180" : ""}`}
                      />
                    </div>
                  </td>
                </tr>
                {expandedBp === bp.id && (
                  <tr className="bg-gray-50 dark:bg-gray-800/50">
                    <td colSpan={6} className="px-6 py-4">
                      {loadingDetail ? (
                        <div className="animate-pulse space-y-2">
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                        </div>
                      ) : bp.processing_error ? (
                        <div className="p-3 bg-red-400/10 border border-red-400/30 rounded-lg text-red-400 text-sm">
                          <AlertTriangle className="w-4 h-4 inline mr-2" />
                          {bp.processing_error}
                        </div>
                      ) : extractionDetail ? (
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="text-gray-500 dark:text-gray-400 block text-xs">Extraction ID</span>
                              <span className="font-mono text-xs text-gray-700 dark:text-gray-300">{extractionDetail.id}</span>
                            </div>
                            <div>
                              <span className="text-gray-500 dark:text-gray-400 block text-xs">Method</span>
                              <span className="text-gray-700 dark:text-gray-300">{extractionDetail.extraction_method}</span>
                            </div>
                            <div>
                              <span className="text-gray-500 dark:text-gray-400 block text-xs">AI Model</span>
                              <span className="font-mono text-xs text-gray-700 dark:text-gray-300">{extractionDetail.ai_model_used}</span>
                            </div>
                            <div>
                              <span className="text-gray-500 dark:text-gray-400 block text-xs">Confidence</span>
                              <span className="text-gray-700 dark:text-gray-300">
                                {(extractionDetail.overall_confidence * 100).toFixed(0)}%
                              </span>
                            </div>
                          </div>
                          {extractionDetail.fields.length > 0 && (
                            <div>
                              <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                                Extracted Fields ({extractionDetail.fields.length})
                              </h4>
                              <div className="bg-white dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-700 max-h-60 overflow-auto">
                                {extractionDetail.fields.map((field, i) => (
                                  <div
                                    key={i}
                                    className="px-3 py-2 border-b border-gray-100 dark:border-gray-700/50 last:border-0 text-xs"
                                  >
                                    <div className="flex items-center justify-between">
                                      <span className="font-medium text-gray-700 dark:text-gray-300">
                                        {field.field_category} / {field.field_name}
                                      </span>
                                      <span className="text-gray-400">
                                        {(field.confidence * 100).toFixed(0)}%
                                      </span>
                                    </div>
                                    {field.field_value && (
                                      <pre className="mt-1 text-gray-500 dark:text-gray-400 whitespace-pre-wrap break-all max-h-32 overflow-auto font-mono text-[10px]">
                                        {field.field_value.length > 500
                                          ? field.field_value.slice(0, 500) + "..."
                                          : field.field_value}
                                      </pre>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          No extraction data available for this blueprint.
                        </p>
                      )}
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                  {search || statusFilter !== "all" ? "No blueprints match your filters." : "No blueprints found."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <Pagination
          currentPage={currentPage}
          totalItems={totalItems}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
        />
      </div>

      <ConfirmModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Blueprint"
        description={
          <>
            Are you sure you want to delete{" "}
            <strong>{deleteTarget?.file_name}</strong>? All associated
            extractions and extracted fields will also be removed. This action
            cannot be undone.
          </>
        }
        confirmLabel="Delete Blueprint"
        variant="danger"
        isLoading={deleting}
      />
    </div>
  );
}
