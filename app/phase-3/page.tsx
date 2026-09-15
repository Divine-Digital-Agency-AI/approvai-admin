import type { Metadata } from "next";
import { ImprovementsHome } from "@/components/improvements/ImprovementsHome";

export const metadata: Metadata = {
  title: "Project overview — Screen enclosure",
  description: "What we agreed to build and where the Cape Coral screen enclosure stands.",
};

export default function LiveImprovementsPage() {
  return <ImprovementsHome />;
}
