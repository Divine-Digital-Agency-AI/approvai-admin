"use client";

import { useTheme } from "@/lib/theme-context";
import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();

  return (
    <div
      className={cn(
        "flex items-center rounded-[10px] border border-[#d4d4d4] bg-white p-1 dark:border-[#333333] dark:bg-[#1a1a1a]",
        className
      )}
      role="group"
      aria-label="Theme"
    >
      <button
        type="button"
        onClick={() => setTheme("light")}
        className={cn(
          "flex h-8 items-center gap-1.5 rounded-[8px] px-2.5 text-sm font-medium transition-colors",
          theme === "light"
            ? "bg-[#f7f7f7] text-[#1f81df] shadow-sm"
            : "text-[#666666] hover:text-[#1a1a1a] dark:text-[#7f7f7f] dark:hover:text-white"
        )}
        aria-label="Switch to light mode"
        aria-pressed={theme === "light"}
        title="Light mode"
      >
        <Sun className="h-4 w-4" strokeWidth={1.75} />
        <span className="hidden xl:inline">Light</span>
      </button>
      <button
        type="button"
        onClick={() => setTheme("dark")}
        className={cn(
          "flex h-8 items-center gap-1.5 rounded-[8px] px-2.5 text-sm font-medium transition-colors",
          theme === "dark"
            ? "bg-[#0d0d0d] text-[#1f81df] shadow-sm"
            : "text-[#666666] hover:text-[#1a1a1a] dark:text-[#7f7f7f] dark:hover:text-white"
        )}
        aria-label="Switch to dark mode"
        aria-pressed={theme === "dark"}
        title="Dark mode"
      >
        <Moon className="h-4 w-4" strokeWidth={1.75} />
        <span className="hidden xl:inline">Dark</span>
      </button>
    </div>
  );
}
