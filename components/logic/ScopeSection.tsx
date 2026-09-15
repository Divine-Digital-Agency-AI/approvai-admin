"use client";

import { ListSection } from "./ListSection";

interface ScopeSectionProps {
  inScope: string[];
  phase4: string[];
  assumptions: string[];
  present: boolean;
  onInScopeChange: (index: number, value: string) => void;
  onAddInScope: () => void;
  onRemoveInScope: (index: number) => void;
  onPhase4Change: (index: number, value: string) => void;
  onAddPhase4: () => void;
  onRemovePhase4: (index: number) => void;
  onAssumptionChange: (index: number, value: string) => void;
  onAddAssumption: () => void;
  onRemoveAssumption: (index: number) => void;
}

export function ScopeSection({
  inScope,
  phase4,
  assumptions,
  present,
  onInScopeChange,
  onAddInScope,
  onRemoveInScope,
  onPhase4Change,
  onAddPhase4,
  onRemovePhase4,
  onAssumptionChange,
  onAddAssumption,
  onRemoveAssumption,
}: ScopeSectionProps) {
  return (
    <div id="scope" className="scroll-mt-24 grid gap-6 lg:grid-cols-2">
      <ListSection
        eyebrow="Phase 3 · In scope"
        title="What we will build"
        items={inScope}
        present={present}
        headersLocked
        onEyebrowChange={() => undefined}
        onTitleChange={() => undefined}
        onItemChange={onInScopeChange}
        onAddItem={onAddInScope}
        onRemoveItem={onRemoveInScope}
      />
      <ListSection
        eyebrow="Phase 4 · Out"
        title="Not this phase"
        items={phase4}
        present={present}
        headersLocked
        onEyebrowChange={() => undefined}
        onTitleChange={() => undefined}
        onItemChange={onPhase4Change}
        onAddItem={onAddPhase4}
        onRemoveItem={onRemovePhase4}
      />
      <div className="lg:col-span-2">
        <ListSection
          eyebrow="Assumptions"
          title="What we are treating as true"
          items={assumptions}
          present={present}
          headersLocked
          onEyebrowChange={() => undefined}
          onTitleChange={() => undefined}
          onItemChange={onAssumptionChange}
          onAddItem={onAddAssumption}
          onRemoveItem={onRemoveAssumption}
        />
      </div>
    </div>
  );
}
