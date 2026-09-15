import type { RealtimeChannel } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

export type SharedBoardKey = "logic" | "work";

interface SharedBoardRow {
  payload: unknown;
}

export async function loadSharedBoard(boardKey: SharedBoardKey): Promise<unknown | null> {
  const { data, error } = await supabase
    .from("phase3_admin_boards")
    .select("payload")
    .eq("board_key", boardKey)
    .maybeSingle();

  if (error) throw error;
  return (data as SharedBoardRow | null)?.payload ?? null;
}

export async function saveSharedBoard(boardKey: SharedBoardKey, payload: unknown): Promise<void> {
  const { error } = await supabase
    .from("phase3_admin_boards")
    .upsert({ board_key: boardKey, payload }, { onConflict: "board_key" });

  if (error) throw error;
}

export function subscribeToSharedBoard(
  boardKey: SharedBoardKey,
  onPayload: (payload: unknown) => void
): RealtimeChannel {
  return supabase
    .channel(`phase3-board-${boardKey}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "phase3_admin_boards",
        filter: `board_key=eq.${boardKey}`,
      },
      (change) => {
        const row = change.new as Record<string, unknown>;
        if (row.payload !== undefined) onPayload(row.payload);
      }
    )
    .subscribe();
}

export async function unsubscribeFromSharedBoard(channel: RealtimeChannel): Promise<void> {
  await supabase.removeChannel(channel);
}
