"use client";

import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { workGroupId } from "@/lib/work/groups";
import type { WorkTask } from "@/lib/work/types";

const STEPS = [
  { name: "1 · Find project and start chat", title: "Find the job and start talking", proof: "Open a project and begin in chat." },
  { name: "2 · Identify requirements", title: "Show only the required documents", proof: "The contractor sees the documents relevant to this project." },
  { name: "3 · Prefill documents", title: "Fill the official forms", proof: "Forms come prefilled from the chat, parcel, and plans." },
  { name: "4 · Review like Brian", title: "Review the plans", proof: "Pass, or a short list the engineer can act on." },
  { name: "5 · Signature and tracking", title: "Get signatures back", proof: "Send, see who has it, and get the signed file back." },
  { name: "6 · Complete packet", title: "Hand over a complete packet", proof: "One folder they can download and file." },
] as const;

export function DeliverySlices({ tasks, present }: { tasks: WorkTask[]; present: boolean }) {
  return (
    <section className="rounded-2xl border border-[#e4e4e4] bg-white p-6">
      <p className="text-xs font-semibold uppercase tracking-[0.08em] text-primary">Current work</p>
      <h2 className="mt-1 text-xl font-semibold text-[#1a1a1a]">What we are building</h2>
      <p className="mt-1 text-sm leading-6 text-[#5c5c5c]">
        Each step will result in something you can review directly in the product.
      </p>
      <ol className="mt-5 grid gap-3 md:grid-cols-2">
        {STEPS.map((step, index) => {
          const items = tasks.filter((task) => task.group === step.name);
          const done = items.filter((task) => task.status === "done").length;
          const complete = items.length > 0 && done === items.length;
          return (
            <li key={step.name}>
              <Link
                href={`/phase-3/now?view=all#work-${workGroupId(step.name)}`}
                className="flex h-full gap-3 rounded-xl border border-[#e4e4e4] p-4 hover:border-primary/40 hover:bg-[#edf5fc]"
              >
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#edf5fc] text-xs font-semibold text-primary">
                  {complete ? <CheckCircle2 className="h-4 w-4" /> : index + 1}
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-[#1a1a1a]">{step.title}</span>
                  <span className="mt-1 block text-xs leading-5 text-[#5c5c5c]">{step.proof}</span>
                  {!present && items.length > 0 && (
                    <span className="mt-2 block text-xs font-medium text-primary">
                      {done}/{items.length} done
                    </span>
                  )}
                </span>
              </Link>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
