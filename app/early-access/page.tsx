"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";
import { TableSkeleton } from "@/components/skeletons/TableSkeleton";
import Button from "@/components/shared/Button";
import Input from "@/components/shared/Input";
import { MailPlus, Trash2, Plus, X } from "lucide-react";

interface EarlyAccessEmail {
  id: string;
  email: string;
  added_at: string;
}

export default function EarlyAccessPage() {
  const { admin, loading } = useAuth();
  const router = useRouter();
  const [emails, setEmails] = useState<EarlyAccessEmail[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!loading && !admin) router.push("/login");
  }, [admin, loading, router]);

  const fetchEmails = async () => {
    try {
      const { data, error } = await supabase
        .from("early_access_emails")
        .select("*")
        .order("added_at", { ascending: false });

      if (error) throw error;
      setEmails(data || []);
    } catch (err: any) {
      if (err?.code === "42P01") {
        setEmails([]);
      } else {
        console.error("Failed to fetch early access emails:", err);
      }
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    if (!admin) return;
    fetchEmails();
  }, [admin]);

  const handleAdd = async () => {
    setError("");
    setAdding(true);

    try {
      const trimmed = newEmail.trim().toLowerCase();
      if (!trimmed) return;

      const { error: insertError } = await supabase
        .from("early_access_emails")
        .insert({ email: trimmed });

      if (insertError) {
        if (insertError.code === "23505") {
          setError("This email is already on the early access list.");
        } else {
          throw insertError;
        }
      } else {
        setNewEmail("");
        setIsAddModalOpen(false);
        await fetchEmails();
      }
    } catch (err: any) {
      setError(err.message || "Failed to add email.");
    } finally {
      setAdding(false);
    }
  };

  const handleRemove = async (id: string) => {
    try {
      await supabase.from("early_access_emails").delete().eq("id", id);
      setEmails((prev) => prev.filter((e) => e.id !== id));
    } catch (err) {
      console.error("Failed to remove email:", err);
    }
  };

  if (loading || !admin) return <TableSkeleton />;
  if (loadingData) return <TableSkeleton />;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <MailPlus className="w-6 h-6 text-primary" />
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Early Access</h1>
        <span className="text-sm text-gray-500 dark:text-gray-400 ml-auto">{emails.length} emails</span>
        <Button
          type="button"
          size="sm"
          icon={<Plus className="w-4 h-4" />}
          onClick={() => {
            setError("");
            setNewEmail("");
            setIsAddModalOpen(true);
          }}
        >
          Add
        </Button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
              <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Email</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Added</th>
              <th className="text-right px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Actions</th>
            </tr>
          </thead>
          <tbody>
            {emails.map((item) => (
              <tr key={item.id} className="border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                <td className="px-4 py-3 text-gray-900 dark:text-white">{item.email}</td>
                <td className="px-4 py-3 text-gray-500 dark:text-gray-400">
                  {new Date(item.added_at).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => handleRemove(item.id)}
                    className="p-1.5 rounded-lg text-red-400 hover:bg-red-400/10 transition-colors"
                    title="Remove"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
            {emails.length === 0 && (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                  No emails on the early access list yet. Add one with the button above.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isAddModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget && !adding) {
              setIsAddModalOpen(false);
              setError("");
              setNewEmail("");
            }
          }}
        >
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
          <div className="relative z-10 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-md">
            <button
              onClick={() => {
                setIsAddModalOpen(false);
                setError("");
                setNewEmail("");
              }}
              disabled={adding}
              className="absolute top-4 right-4 p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Add Early Access Email</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Add a new email to the early access list.
              </p>

              {error && (
                <div className="mt-4 p-3 bg-red-400/20 border border-red-400/50 rounded-lg text-red-400 text-sm">
                  {error}
                </div>
              )}

              <form
                className="mt-4 space-y-4"
                onSubmit={async (e) => {
                  e.preventDefault();
                  await handleAdd();
                }}
              >
                <Input
                  type="email"
                  placeholder="user@example.com"
                  value={newEmail}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewEmail(e.target.value)}
                  required
                  autoFocus
                />
                <div className="flex justify-end gap-3">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setIsAddModalOpen(false);
                      setError("");
                      setNewEmail("");
                    }}
                    disabled={adding}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    icon={<Plus className="w-4 h-4" />}
                    isLoading={adding}
                    disabled={!newEmail.trim() || adding}
                  >
                    Add
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
