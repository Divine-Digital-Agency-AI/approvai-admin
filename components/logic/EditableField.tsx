"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface EditableFieldProps {
  value: string;
  onChange: (value: string) => void;
  present?: boolean;
  placeholder?: string;
  rows?: number;
  className?: string;
  muted?: boolean;
}

export function EditableField({
  value,
  onChange,
  present = false,
  placeholder = "",
  rows = 3,
  className,
  muted = false,
}: EditableFieldProps) {
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    node.style.height = "auto";
    node.style.height = `${Math.max(node.scrollHeight, rows * 20)}px`;
  }, [value, rows]);

  if (present) {
    return (
      <p className={cn("whitespace-pre-wrap", muted && "text-[#5c5c5c] dark:text-[#a3a3a3]", className)}>
        {value.trim() || "—"}
      </p>
    );
  }

  return (
    <textarea
      ref={ref}
      value={value}
      rows={rows}
      placeholder={placeholder}
      onChange={(event) => onChange(event.target.value)}
      className={cn(
        "w-full resize-none overflow-hidden bg-transparent outline-none placeholder:text-[#b3b3b3] dark:placeholder:text-[#666]",
        muted && "text-[#5c5c5c] dark:text-[#a3a3a3]",
        className
      )}
    />
  );
}
