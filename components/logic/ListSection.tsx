"use client";

import { Plus, X } from "lucide-react";
import { EditableField } from "./EditableField";

interface ListSectionProps {
  id?: string;
  eyebrow: string;
  title: string;
  items: string[];
  present: boolean;
  headersLocked?: boolean;
  footer?: string;
  onEyebrowChange: (value: string) => void;
  onTitleChange: (value: string) => void;
  onItemChange: (index: number, value: string) => void;
  onAddItem: () => void;
  onRemoveItem: (index: number) => void;
  onFooterChange?: (value: string) => void;
}

export function ListSection({
  id,
  eyebrow,
  title,
  items,
  present,
  headersLocked = false,
  footer,
  onEyebrowChange,
  onTitleChange,
  onItemChange,
  onAddItem,
  onRemoveItem,
  onFooterChange,
}: ListSectionProps) {
  return (
    <section
      id={id}
      className="scroll-mt-24 rounded-2xl border border-[#e4e4e4] bg-white p-6 sm:p-8"
    >
      <EditableField
        value={eyebrow}
        onChange={onEyebrowChange}
        present={present || headersLocked}
        rows={1}
        className="text-xs font-semibold uppercase tracking-[0.08em] text-primary"
      />
      <EditableField
        value={title}
        onChange={onTitleChange}
        present={present || headersLocked}
        rows={1}
        className="mt-1 text-xl font-semibold text-[#1a1a1a]"
      />
      <ol className="mt-5 space-y-3">
        {items.map((item, index) => (
          <li key={index} className="flex items-start gap-2">
            <span className="mt-2 w-5 shrink-0 text-sm font-medium text-[#999]">{index + 1}.</span>
            <EditableField
              value={item}
              onChange={(value) => onItemChange(index, value)}
              present={present}
              rows={2}
              className="text-[15px] leading-6 text-[#1a1a1a]"
            />
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
          Add line
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
