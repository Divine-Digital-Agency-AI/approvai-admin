"use client";

import { Plus, X } from "lucide-react";
import { EditableField } from "./EditableField";
import { cn } from "@/lib/utils";
import type { DecisionItem, DecisionStatus } from "@/lib/logic/types";

const STATUSES: { id: DecisionStatus; label: string }[] = [
  { id: "open", label: "Open" },
  { id: "yes", label: "Yes" },
  { id: "no", label: "No" },
];

interface DecisionSectionProps {
  eyebrow: string;
  title: string;
  hint?: string;
  items: DecisionItem[];
  present: boolean;
  footer?: string;
  onEyebrowChange: (value: string) => void;
  onTitleChange: (value: string) => void;
  onHintChange?: (value: string) => void;
  onItemChange: (index: number, value: string) => void;
  onNoteChange?: (index: number, value: string) => void;
  onStatusChange: (index: number, status: DecisionStatus) => void;
  onAddItem: () => void;
  onRemoveItem: (index: number) => void;
  onFooterChange?: (value: string) => void;
}

export function DecisionSection({
  eyebrow,
  title,
  hint,
  items,
  present,
  footer,
  onEyebrowChange,
  onTitleChange,
  onHintChange,
  onItemChange,
  onNoteChange,
  onStatusChange,
  onAddItem,
  onRemoveItem,
  onFooterChange,
}: DecisionSectionProps) {
  return (
    <section
      id="decisions"
      className="scroll-mt-24 rounded-2xl border border-[#e4e4e4] bg-white p-6 sm:p-8"
    >
      <EditableField
        value={eyebrow}
        onChange={onEyebrowChange}
        present={present}
        rows={1}
        className="text-xs font-semibold uppercase tracking-[0.08em] text-primary"
      />
      <EditableField
        value={title}
        onChange={onTitleChange}
        present={present}
        rows={1}
        className="mt-1 text-xl font-semibold text-[#1a1a1a]"
      />
      {hint !== undefined && onHintChange && (
        <EditableField
          value={hint}
          onChange={onHintChange}
          present={present}
          rows={2}
          muted
          className="mt-2 text-sm"
        />
      )}
      <ol className="mt-6 space-y-5">
        {items.map((item, index) => (
          <li key={item.id} className="flex items-start gap-3 border-b border-[#f0f0f0] pb-5 last:border-b-0 last:pb-0">
            <span className="mt-1 w-5 shrink-0 text-sm font-medium text-[#999]">{index + 1}.</span>
            <div className="min-w-0 flex-1">
              <EditableField
                value={item.text}
                onChange={(value) => onItemChange(index, value)}
                present={present}
                rows={2}
                className="text-[15px] font-medium leading-6 text-[#1a1a1a]"
              />
              {(item.note || !present) && onNoteChange && (
                <EditableField
                  value={item.note ?? ""}
                  onChange={(value) => onNoteChange(index, value)}
                  present={present}
                  rows={2}
                  muted
                  className="mt-1 text-sm"
                />
              )}
              <div className="mt-3 flex flex-wrap gap-1.5">
                {STATUSES.map((status) => (
                  <button
                    key={status.id}
                    type="button"
                    onClick={() => onStatusChange(index, status.id)}
                    className={cn(
                      "rounded-full px-2.5 py-0.5 text-xs font-medium",
                      item.status === status.id
                        ? status.id === "yes"
                          ? "bg-[#e8f6ee] text-[#1b7a3d]"
                          : status.id === "no"
                            ? "bg-[#fdecec] text-[#b42318]"
                            : "bg-[#edf5fc] text-primary"
                        : "bg-[#f7f7f7] text-[#888]"
                    )}
                  >
                    {status.label}
                  </button>
                ))}
              </div>
            </div>
            {!present && items.length > 1 && (
              <button
                type="button"
                onClick={() => onRemoveItem(index)}
                className="mt-1 rounded p-1 text-[#999] hover:bg-black/5 hover:text-[#1a1a1a]"
                aria-label="Remove item"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </li>
        ))}
      </ol>
      {!present && (
        <button
          type="button"
          onClick={onAddItem}
          className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-primary hover:text-primary-hover"
        >
          <Plus className="h-3.5 w-3.5" />
          Add decision
        </button>
      )}
      {footer !== undefined && onFooterChange && (
        <div className="mt-6 border-t border-[#eee] pt-4">
          <EditableField
            value={footer}
            onChange={onFooterChange}
            present={present}
            rows={2}
            muted
            className="text-sm"
          />
        </div>
      )}
    </section>
  );
}
