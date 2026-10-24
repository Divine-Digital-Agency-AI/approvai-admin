import type { createServiceClient } from "@/app/api/admin/_lib/auth";
import { jobStage, type Stage } from "@/lib/job-stage";

type Supabase = ReturnType<typeof createServiceClient>;

export interface JobFacts {
  blueprintCount: number;
  lastActivity: string | null;
  stage: Stage;
}

/** Where each job stands with Ant, for the projects list and the dashboard (one source, so they always agree). */
export async function jobFacts(
  supabase: Supabase,
  projects: { id: string; intake_data?: unknown }[]
): Promise<Map<string, JobFacts>> {
  const { data: blueprints } = await supabase.from("blueprints").select("project_id, status, updated_at");
  const bpCount: Record<string, number> = {};
  const bpLatest: Record<string, { status: string; updated_at: string | null }> = {};
  for (const bp of blueprints || []) {
    if (!bp.project_id) continue;
    bpCount[bp.project_id] = (bpCount[bp.project_id] || 0) + 1;
    const seen = bpLatest[bp.project_id];
    if (!seen || String(bp.updated_at || "") > String(seen.updated_at || "")) {
      bpLatest[bp.project_id] = { status: bp.status, updated_at: bp.updated_at };
    }
  }

  // Each job's newest chat message, and whether Ant prepared an application in its chat.
  const { data: threads } = await supabase.from("ant_threads").select("id, project_id").not("project_id", "is", null);
  const threadProject = new Map((threads || []).map((t) => [t.id as string, t.project_id as string]));
  const threadIds = [...threadProject.keys()];
  const lastActivity: Record<string, string> = {};
  const prepared = new Set<string>();
  if (threadIds.length) {
    const { data: recent } = await supabase
      .from("ant_messages")
      .select("thread_id, created_at")
      .in("thread_id", threadIds)
      .order("created_at", { ascending: false })
      .limit(5000);
    for (const m of recent || []) {
      const project = threadProject.get(m.thread_id as string);
      if (project && !lastActivity[project]) lastActivity[project] = m.created_at as string;
    }
    const { data: applications } = await supabase
      .from("ant_messages")
      .select("thread_id")
      .in("thread_id", threadIds)
      .not("metadata->application", "is", null)
      .limit(2000);
    for (const m of applications || []) {
      const project = threadProject.get(m.thread_id as string);
      if (project) prepared.add(project);
    }
  }

  const facts = new Map<string, JobFacts>();
  for (const p of projects) {
    facts.set(p.id, {
      blueprintCount: bpCount[p.id] || 0,
      lastActivity: lastActivity[p.id] || null,
      stage: jobStage({
        intake: p.intake_data,
        blueprint: bpLatest[p.id] || null,
        lastActivity: lastActivity[p.id] || null,
        applicationPrepared: prepared.has(p.id),
      }),
    });
  }
  return facts;
}
