import type { LucideIcon } from "lucide-react";
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
  Compass,
  Map,
  ListChecks,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

export const LIVE_PAGES = {
  home: { href: "/project-overview", label: "Project overview" },
  plan: { href: "/plan-approvals", label: "Plan & approvals" },
  now: { href: "/project-overview/now", label: "Delivery status" },
} as const;

export const NAV_GROUPS: NavGroup[] = [
  {
    label: "Overview",
    items: [{ label: "Dashboard", href: "/", icon: LayoutDashboard }],
  },
  {
    label: "Screen enclosure project",
    items: [
      { label: LIVE_PAGES.home.label, href: LIVE_PAGES.home.href, icon: Compass },
      { label: LIVE_PAGES.plan.label, href: LIVE_PAGES.plan.href, icon: Map },
      { label: LIVE_PAGES.now.label, href: LIVE_PAGES.now.href, icon: ListChecks },
    ],
  },
  {
    label: "Operations",
    items: [
      { label: "Users", href: "/users", icon: Users },
      { label: "Projects", href: "/projects", icon: FolderKanban },
      { label: "Blueprints", href: "/blueprints", icon: FileSearch },
      { label: "AI Usage", href: "/extractions", icon: Cpu },
      { label: "Analytics", href: "/analytics", icon: BarChart3 },
    ],
  },
  {
    label: "Admin",
    items: [
      { label: "Municipalities", href: "/municipalities", icon: Building2 },
      { label: "Early Access", href: "/early-access", icon: MailPlus },
      { label: "Emails", href: "/emails", icon: Mail },
      { label: "Settings", href: "/settings", icon: Settings },
    ],
  },
];

export function isNavActive(pathname: string | null | undefined, href: string): boolean {
  if (!pathname) return false;
  if (href === "/") return pathname === "/";
  if (href === "/project-overview") return pathname === "/project-overview";
  return pathname === href || pathname.startsWith(`${href}/`);
}
