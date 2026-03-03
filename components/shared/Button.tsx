"use client";

import { ButtonHTMLAttributes, ReactNode } from "react";
import { Loader2 } from "lucide-react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "outline" | "white" | "white-outline";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  icon?: ReactNode;
  children?: ReactNode;
}

export default function Button({
  variant = "primary",
  size = "md",
  isLoading = false,
  icon,
  children,
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles =
    "inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed";

  const variantStyles = {
    primary:
      "bg-primary text-white hover:bg-primary-hover active:bg-primary/80",
    secondary:
      "bg-surface text-foreground hover:bg-surface/80 active:bg-surface/70",
    ghost:
      "bg-transparent text-foreground hover:bg-surface/50 active:bg-surface/70",
    danger:
      "bg-red-400/20 text-red-400 hover:bg-red-400/30 active:bg-red-400/40",
    outline:
      "bg-transparent border-0 text-primary dark:text-white hover:bg-primary/10 dark:hover:bg-primary/20 active:bg-primary/20",
    white:
      "bg-white text-gray-900 hover:bg-gray-100 active:bg-gray-200 border border-gray-300",
    "white-outline":
      "bg-transparent border-2 border-gray-900 dark:border-white text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 active:bg-gray-200 dark:active:bg-gray-700",
  };

  const sizeStyles = {
    sm: "px-3 py-1.5 text-sm gap-1.5",
    md: "px-4 py-2 text-base gap-2",
    lg: "px-6 py-3 text-lg gap-2",
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Loading...</span>
        </>
      ) : (
        <>
          {icon && <span className="flex-shrink-0">{icon}</span>}
          {children}
        </>
      )}
    </button>
  );
}
