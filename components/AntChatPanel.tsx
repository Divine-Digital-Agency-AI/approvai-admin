"use client";

import { useEffect, useState } from "react";
import { adminFetch } from "@/lib/admin-api";

interface AntMessage {
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

/** What Ant said on this job, read only: the person's words and Ant's, newest at the bottom. */
export function AntChatPanel({ projectId }: { projectId: string }) {
  const [messages, setMessages] = useState<AntMessage[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await adminFetch(`/api/admin/projects/ant?projectId=${encodeURIComponent(projectId)}`);
        const payload = (await res.json()) as { messages?: AntMessage[]; error?: string };
        if (!res.ok) throw new Error(payload.error || "Could not load the chat.");
        if (alive) setMessages(payload.messages || []);
      } catch (err) {
        if (alive) setError(err instanceof Error ? err.message : "Could not load the chat.");
      }
    })();
    return () => {
      alive = false;
    };
  }, [projectId]);

  return (
    <section aria-label="What Ant said" className="mt-4">
      <h3 className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">What Ant said</h3>
      {error && <p className="text-sm text-red-500">{error}</p>}
      {!error && messages === null && <p className="text-sm text-gray-500 dark:text-gray-400">Loading the chat…</p>}
      {messages && messages.length === 0 && (
        <p className="text-sm text-gray-500 dark:text-gray-400">No chat with Ant on this job yet.</p>
      )}
      {messages && messages.length > 0 && (
        <ol className="max-h-96 space-y-2 overflow-y-auto rounded-lg border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-900">
          {messages.map((m, i) => (
            <li key={i} className={m.role === "assistant" ? "pr-6" : "pl-6"}>
              <div className="text-[11px] text-gray-500 dark:text-gray-400">
                {m.role === "assistant" ? "Ant" : "Them"} · {new Date(m.created_at).toLocaleString()}
              </div>
              <p
                className={`whitespace-pre-wrap break-words rounded-lg px-3 py-2 text-sm ${
                  m.role === "assistant"
                    ? "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100"
                    : "bg-primary/10 text-gray-900 dark:text-gray-100"
                }`}
              >
                {m.content}
              </p>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
