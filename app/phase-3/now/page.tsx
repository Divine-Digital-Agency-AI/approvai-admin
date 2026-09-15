import type { Metadata } from "next";
import { Suspense } from "react";
import { WorkWorkspace } from "@/components/work/WorkWorkspace";

export const metadata: Metadata = {
  title: "Delivery status — Screen enclosure",
  description: "Current work, open questions, and what will be reviewed next.",
};

export default function Phase3NowPage() {
  return (
    <Suspense fallback={<div className="min-h-[50vh] bg-[#f7f7f7]" />}>
      <WorkWorkspace />
    </Suspense>
  );
}
