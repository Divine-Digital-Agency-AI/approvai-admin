"use client";

import Link from "next/link";
import { ArrowRight, ListChecks, Map } from "lucide-react";
import { LIVE_PAGES } from "@/components/layout/nav";
import { boardCard, boardHoverSoft, boardMuted, boardPage } from "@/lib/themed-surfaces";
import { cn } from "@/lib/utils";

export function ImprovementsHome() {
  return (
    <div className={boardPage}>
      <div className="mx-auto flex max-w-[800px] flex-col gap-6 px-4 py-10 sm:px-6 lg:px-8">
        <header className={cn(boardCard, "px-6 py-7 sm:px-8")}>
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-primary">
            Screen enclosure project
          </p>
          <h1 className="mt-2 text-2xl font-semibold leading-8">Cape Coral screen enclosure</h1>
          <p className={cn("mt-3 text-[15px] leading-7", boardMuted)}>
            We want a contractor who has never used ApprovAI to finish one Cape Coral screen
            enclosure — from login to a packet they can file — with a straightforward, self-guided experience.
          </p>
          <p className={cn("mt-3 text-[15px] leading-7", boardMuted)}>
            Use Plan &amp; approvals to review the proposed experience and provide feedback. Use
            Delivery status to see what we are building and what requires your input.
          </p>
        </header>

        <section className="grid gap-4 md:grid-cols-2">
          <Link
            href={LIVE_PAGES.plan.href}
            className={cn(boardCard, "p-6 transition-colors hover:border-primary/40", boardHoverSoft)}
          >
            <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.08em] text-primary">
              <Map className="h-3.5 w-3.5" />
              {LIVE_PAGES.plan.label}
            </span>
            <h2 className="mt-2 text-lg font-semibold">Decisions we need from you</h2>
            <p className={cn("mt-1 text-sm leading-6", boardMuted)}>
              Six focused questions to confirm the experience before implementation begins.
            </p>
            <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
              Open
              <ArrowRight className="h-4 w-4" />
            </span>
          </Link>
          <Link
            href={LIVE_PAGES.now.href}
            className={cn(boardCard, "p-6 transition-colors hover:border-primary/40", boardHoverSoft)}
          >
            <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.08em] text-primary">
              <ListChecks className="h-3.5 w-3.5" />
              {LIVE_PAGES.now.label}
            </span>
            <h2 className="mt-2 text-lg font-semibold">What we are building</h2>
            <p className={cn("mt-1 text-sm leading-6", boardMuted)}>
              Current work, items requiring your input, and what will be ready for review next.
            </p>
            <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
              Open
              <ArrowRight className="h-4 w-4" />
            </span>
          </Link>
        </section>
      </div>
    </div>
  );
}
