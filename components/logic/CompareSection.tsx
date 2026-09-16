"use client";

import { Plus, X } from "lucide-react";
import { EditableField } from "./EditableField";
import { boardCard, boardIconBtn, boardMuted, boardSoft, boardTitle } from "@/lib/themed-surfaces";
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
      className={cn("scroll-mt-24 p-6 sm:p-8", boardCard)}
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
        className={cn("mt-1 text-xl font-semibold", boardTitle)}
      />
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {columns.map((column) => (
          <div
            key={column.id}
            className={cn(
              "rounded-xl p-5",
              column.proposed ? boardSoft : "bg-[#f7f7f7] dark:bg-[#141414]"
            )}
          >
            <EditableField
              value={column.title}
              onChange={(value) => onColumnTitleChange(column.id, value)}
              present={present}
              rows={1}
              className={cn(
                "text-xs font-semibold uppercase tracking-[0.06em]",
                column.proposed ? "text-primary" : boardMuted
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
                    className={cn("text-[15px] leading-6", boardTitle)}
                  />
                  {!present && column.items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => onRemoveItem(column.id, index)}
                      className={cn("mt-1", boardIconBtn)}
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
