"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSidebar } from "./SidebarContext";
import { useAuth } from "@/lib/auth-context";
import {
  LayoutDashboard,
  Users,
  MailPlus,
  Mail,
  FolderKanban,
  Building2,
  FileSearch,
  Settings,
  Cpu,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";

const SIDEBAR_COLLAPSED_WIDTH = "72px";
const SIDEBAR_EXPANDED_WIDTH = "200px";
const SIDEBAR_EXPANDED_KEY = "approvai-admin-sidebar-expanded";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
}

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Users", href: "/users", icon: Users },
  { label: "Projects", href: "/projects", icon: FolderKanban },
  { label: "Blueprints", href: "/blueprints", icon: FileSearch },
  { label: "AI Usage", href: "/extractions", icon: Cpu },
  { label: "Analytics", href: "/analytics", icon: BarChart3 },
  { label: "Municipalities", href: "/municipalities", icon: Building2 },
  { label: "Early Access", href: "/early-access", icon: MailPlus },
  { label: "Emails", href: "/emails", icon: Mail },
  { label: "Settings", href: "/settings", icon: Settings },
];

function applySidebarWidth(expanded: boolean, mobile: boolean) {
  const width = mobile ? "0px" : expanded ? SIDEBAR_EXPANDED_WIDTH : SIDEBAR_COLLAPSED_WIDTH;
  document.documentElement.style.setProperty("--sidebar-width", width);
}

function adminInitials(email: string | undefined): string {
  if (!email) return "A";
  const local = email.split("@")[0] || "A";
  const parts = local.split(/[._-]/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0] || ""}${parts[1][0] || ""}`.toUpperCase();
  }
  return local.slice(0, 2).toUpperCase();
}

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { isExpanded, setIsExpanded, toggleExpanded } = useSidebar();
  const { admin } = useAuth();
  const [isMobile, setIsMobile] = useState(false);
  const email = admin?.authUser.email;
  const initials = adminInitials(email);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(SIDEBAR_EXPANDED_KEY);
      if (stored === "false") setIsExpanded(false);
      if (stored === "true") setIsExpanded(true);
    } catch {
      /* ignore */
    }
  }, [setIsExpanded]);

  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      applySidebarWidth(isExpanded, mobile);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, [isExpanded]);

  useEffect(() => {
    if (!isMobile) {
      applySidebarWidth(isExpanded, false);
      try {
        localStorage.setItem(SIDEBAR_EXPANDED_KEY, String(isExpanded));
      } catch {
        /* ignore */
      }
    }
  }, [isExpanded, isMobile]);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname?.startsWith(href);
  };

  if (isMobile) return null;

  const navButtonClass = (active: boolean) =>
    cn(
      "flex h-11 items-center rounded-[14px] transition-colors",
      isExpanded ? "w-full gap-3 px-3" : "w-12 justify-center",
      active
        ? "border-l border-[#1f81df] bg-[#f7f7f7] text-[#1f81df] dark:bg-[#1a1a1a] dark:text-white"
        : "text-[#666666] hover:bg-[#f0f0f0] dark:text-[#7f7f7f] dark:hover:bg-[#1a1a1a]"
    );

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-[70] flex h-screen flex-col bg-[#e5e5e5] transition-[width] duration-300 dark:bg-black",
        isExpanded ? "w-[200px] px-4 py-6" : "w-[72px] items-center px-3 py-6"
      )}
    >
      <div
        className={cn(
          "mb-4 flex w-full items-center py-2",
          isExpanded ? "gap-2" : "flex-col gap-3"
        )}
      >
        <Link
          href="/"
          className={cn("flex min-w-0 items-center", isExpanded ? "gap-2" : "")}
          aria-label="ApprovAI Admin home"
        >
          <img
            src="/ant.png"
            alt=""
            width={52}
            height={27}
            className="h-[27px] w-9 shrink-0 object-contain object-left"
          />
          {isExpanded && (
            <div className="min-w-0">
              <span className="block truncate text-sm font-semibold tracking-tight text-[#1a1a1a] dark:text-white">
                ApprovAI
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-[#1f81df]">
                <Shield className="h-2.5 w-2.5" strokeWidth={2} />
                Admin
              </span>
            </div>
          )}
        </Link>
        <button
          type="button"
          onClick={toggleExpanded}
          className={cn(
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] text-[#666666] transition-colors hover:bg-[#f0f0f0] dark:text-[#7f7f7f] dark:hover:bg-[#1a1a1a]",
            isExpanded && "ml-auto"
          )}
          title={isExpanded ? "Collapse menu" : "Expand menu"}
          aria-label={isExpanded ? "Collapse menu" : "Expand menu"}
          aria-expanded={isExpanded}
        >
          {isExpanded ? (
            <ChevronLeft className="h-4 w-4" strokeWidth={1.75} />
          ) : (
            <ChevronRight className="h-4 w-4" strokeWidth={1.75} />
          )}
        </button>
      </div>

      <div
        className={cn(
          "mb-4 h-px bg-[#d4d4d4] dark:bg-[#333333]",
          isExpanded ? "w-full" : "w-full max-w-[48px]"
        )}
      />

      <nav className={cn("flex flex-1 flex-col gap-0.5 overflow-y-auto", isExpanded ? "w-full" : "items-center")}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <button
              key={item.href}
              type="button"
              onClick={() => router.push(item.href)}
              className={navButtonClass(active)}
              title={!isExpanded ? item.label : undefined}
              aria-label={item.label}
              aria-current={active ? "page" : undefined}
            >
              <Icon className="h-[18px] w-[18px] shrink-0" strokeWidth={1.75} />
              {isExpanded && <span className="truncate text-sm font-medium">{item.label}</span>}
            </button>
          );
        })}
      </nav>

      <div className={cn("mt-auto flex flex-col", isExpanded ? "w-full gap-2" : "items-center gap-3")}>
        {isExpanded && (
          <>
            <div className="mb-2 h-px w-full bg-[#d4d4d4] dark:bg-[#333333]" />
            <div className="flex w-full items-center gap-3 rounded-[14px] px-2 py-2">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#1f81df] text-xs font-medium text-white">
                {initials}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-[#1a1a1a] dark:text-white">
                  {email?.split("@")[0] || "Admin"}
                </p>
                {email && (
                  <p className="truncate text-xs text-[#666666] dark:text-[#7f7f7f]">{email}</p>
                )}
              </div>
            </div>
          </>
        )}

        {!isExpanded && (
          <span
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#1f81df] text-[10px] font-semibold text-white"
            title={email || "Admin"}
          >
            {initials}
          </span>
        )}
      </div>
    </aside>
  );
}
