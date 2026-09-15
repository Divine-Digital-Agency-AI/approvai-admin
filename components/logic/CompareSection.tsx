"use client";

import { Plus, X } from "lucide-react";
import { EditableField } from "./EditableField";
import { cn } from "@/lib/utils";
import type { CompareColumn } from "@/lib/logic/types";

interface CompareSectionProps {
  eyebrow: string;
  title: string;
  columns: CompareColumn[];
  present: boolean;
  onEyebrowChange: (value: string) => void;
  onTitleChange: (value: string) => void;
  onColumnTitleChange: (columnId: string, value: string) => void;
  onItemChange: (columnId: string, index: number, value: string) => void;
  onAddItem: (columnId: string) => void;
  onRemoveItem: (columnId: string, index: number) => void;
}

export function CompareSection({
  eyebrow,
  title,
  columns,
  present,
  onEyebrowChange,
  onTitleChange,
  onColumnTitleChange,
  onItemChange,
  onAddItem,
  onRemoveItem,
}: CompareSectionProps) {
  return (
    <section
      id="overview"
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
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {columns.map((column) => (
          <div
            key={column.id}
            className={cn(
              "rounded-xl p-5",
              column.proposed ? "bg-[#edf5fc]" : "bg-[#f7f7f7]"
            )}
          >
            <EditableField
              value={column.title}
              onChange={(value) => onColumnTitleChange(column.id, value)}
              present={present}
              rows={1}
              className={cn(
                "text-xs font-semibold uppercase tracking-[0.06em]",
                column.proposed ? "text-primary" : "text-[#5c5c5c]"
              )}
            />
            <ul className="mt-4 space-y-3">
              {column.items.map((item, index) => (
                <li key={`${column.id}-${index}`} className="flex items-start gap-2">
                  <EditableField
                    value={item}
                    onChange={(value) => onItemChange(column.id, index, value)}
                    present={present}
                    rows={2}
                    className="text-[15px] leading-6 text-[#1a1a1a]"
                  />
                  {!present && column.items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => onRemoveItem(column.id, index)}
                      className="mt-1 rounded p-1 text-[#999] hover:bg-black/5 hover:text-[#1a1a1a]"
                      aria-label="Remove line"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </li>
              ))}
            </ul>
            {!present && (
              <button
                type="button"
                onClick={() => onAddItem(column.id)}
                className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-primary hover:text-primary-hover"
              >
                <Plus className="h-3.5 w-3.5" />
                Add line
              </button>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
