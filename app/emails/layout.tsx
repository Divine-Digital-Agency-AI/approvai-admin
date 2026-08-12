"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { adminPagePad } from "@/lib/themed-surfaces";

const TABS = [
  { href: "/emails", label: "Sent" },
  { href: "/emails/templates", label: "Templates" },
  { href: "/emails/trades", label: "Trades" },
] as const;

export default function EmailsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div className={cn(adminPagePad, "space-y-6")}>
      <nav className="flex gap-1 rounded-[10px] border border-[#d4d4d4] bg-white p-1 dark:border-[#333333] dark:bg-[#1a1a1a]">
        {TABS.map((tab) => {
          const active =
            tab.href === "/emails"
              ? pathname === "/emails"
              : pathname.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "rounded-[8px] px-3 py-1.5 text-sm font-medium",
                active
                  ? "bg-[#1f81df] text-white"
                  : "text-[#666666] hover:bg-[#f0f0f0] dark:text-[#999999] dark:hover:bg-[#262626]"
              )}
            >
              {tab.label}
            </Link>
          );
        })}
      </nav>
      {children}
    </div>
  );
}
