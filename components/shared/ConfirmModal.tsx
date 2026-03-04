"use client";

import { ReactNode, useEffect, useRef } from "react";
import { AlertTriangle, Trash2, X } from "lucide-react";
import Button from "./Button";

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
    iconBg: "bg-red-100 dark:bg-red-900/30",
    iconColor: "text-red-600 dark:text-red-400",
    buttonVariant: "danger" as const,
  },
  warning: {
    icon: AlertTriangle,
    iconBg: "bg-amber-100 dark:bg-amber-900/30",
    iconColor: "text-amber-600 dark:text-amber-400",
    buttonVariant: "danger" as const,
  },
  info: {
    icon: AlertTriangle,
    iconBg: "bg-blue-100 dark:bg-blue-900/30",
    iconColor: "text-blue-600 dark:text-blue-400",
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === overlayRef.current && !isLoading) onClose();
      }}
    >
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />

      <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-md animate-fade-in">
        <button
          onClick={onClose}
          disabled={isLoading}
          className="absolute top-4 right-4 p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-full ${config.iconBg} flex-shrink-0`}>
              <Icon className={`w-5 h-5 ${config.iconColor}`} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {title}
              </h3>
              {description && (
                <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  {description}
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              disabled={isLoading}
            >
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
    </div>
  );
}
