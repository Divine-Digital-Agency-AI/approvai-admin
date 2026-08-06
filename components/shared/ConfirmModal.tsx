"use client";

import { ReactNode, useEffect, useRef } from "react";
import { AlertTriangle, Trash2, X } from "lucide-react";
import Button from "./Button";
import {
  themedModalBackdrop,
  themedModalCloseButton,
  themedModalFooter,
  themedModalPanel,
} from "@/lib/themed-surfaces";

interface ConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description?: string | ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "warning" | "info";
  isLoading?: boolean;
}

const variantConfig = {
  danger: {
    icon: Trash2,
    iconBg: "bg-red-400/15",
    iconColor: "text-red-500",
    buttonVariant: "danger" as const,
  },
  warning: {
    icon: AlertTriangle,
    iconBg: "bg-amber-400/15",
    iconColor: "text-amber-600 dark:text-amber-400",
    buttonVariant: "danger" as const,
  },
  info: {
    icon: AlertTriangle,
    iconBg: "bg-primary/15",
    iconColor: "text-primary",
    buttonVariant: "primary" as const,
  },
};

export default function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "danger",
  isLoading = false,
}: ConfirmModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const config = variantConfig[variant];
  const Icon = config.icon;

  useEffect(() => {
    if (!open) return;

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isLoading) onClose();
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [open, onClose, isLoading]);

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      className={themedModalBackdrop}
      onClick={(e) => {
        if (e.target === overlayRef.current && !isLoading) onClose();
      }}
    >
      <div className={themedModalPanel}>
        <button
          type="button"
          onClick={onClose}
          disabled={isLoading}
          className={`absolute top-3 right-3 ${themedModalCloseButton}`}
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="p-5 sm:p-6">
          <div className="flex items-start gap-4">
            <div className={`flex shrink-0 rounded-full p-3 ${config.iconBg}`}>
              <Icon className={`h-5 w-5 ${config.iconColor}`} strokeWidth={1.75} />
            </div>
            <div className="min-w-0 flex-1 pr-6">
              <h3 className="text-sm font-semibold text-[#1a1a1a] dark:text-white">{title}</h3>
              {description && (
                <div className="mt-2 text-sm text-[#666666] dark:text-[#7f7f7f]">
                  {description}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className={themedModalFooter}>
          <Button variant="ghost" size="sm" onClick={onClose} disabled={isLoading}>
            {cancelLabel}
          </Button>
          <Button
            variant={config.buttonVariant}
            size="sm"
            onClick={onConfirm}
            isLoading={isLoading}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
