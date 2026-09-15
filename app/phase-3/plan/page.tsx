import type { Metadata } from "next";
import { LogicWorkspace } from "@/components/logic/LogicWorkspace";

export const metadata: Metadata = {
  title: "Plan & approvals — Screen enclosure",
  description: "Review the proposed experience and confirm key decisions.",
};

export default function LiveImprovementsPlanPage() {
  return <LogicWorkspace />;
}
