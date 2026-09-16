"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { boardCard, boardMuted, boardTitle } from "@/lib/themed-surfaces";
import { cn } from "@/lib/utils";

interface NextActionsProps {
  openDecisions: number;
}

export function NextActions({ openDecisions }: NextActionsProps) {
  const remaining =
    openDecisions === 1 ? "One decision is ready for your review." : `${openDecisions} decisions are ready for your review.`;

  return (
    <section id="next" className={cn("scroll-mt-24 p-6 sm:p-8", boardCard)}>
      <p className="text-xs font-semibold uppercase tracking-[0.08em] text-primary">What happens next</p>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className={cn("text-xl font-semibold", boardTitle)}>
            {openDecisions === 0 ? "These decisions are closed." : remaining}
          </h2>
          <p className={cn("mt-1 text-sm leading-6", boardMuted)}>
            {openDecisions === 0
              ? "We can keep building. Check Delivery status for what you can try."
              : "Please confirm each item or let us know what should change. We will incorporate your feedback before continuing."}
          </p>
        </div>
        <Link
          href="/phase-3/now"
          className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover"
        >
          See current work
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}
