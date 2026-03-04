"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSidebar } from "./SidebarContext";
import { useAuth } from "@/lib/auth-context";
import { Orb } from "@/components/orb/Orb";
import {
  LayoutDashboard,
  Users,
  MailPlus,
  FolderKanban,
  Building2,
  FileSearch,
  Settings,
  LogOut,
  Shield,
  Cpu,
  BarChart3,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
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
  { label: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { isExpanded, setIsExpanded } = useSidebar();
  const { signOut, admin } = useAuth();
  const [isMobile, setIsMobile] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push("/login");
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);

      if (mobile) {
        setIsExpanded(false);
        document.documentElement.style.setProperty("--sidebar-width", "0px");
      } else {
        setIsExpanded(false);
        document.documentElement.style.setProperty("--sidebar-width", "60px");
      }
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, [setIsExpanded]);

  const handleMouseEnter = () => {
    if (!isMobile) {
      setIsExpanded(true);
      document.documentElement.style.setProperty("--sidebar-width", "200px");
    }
  };

  const handleMouseLeave = () => {
    if (!isMobile) {
      setIsExpanded(false);
      document.documentElement.style.setProperty("--sidebar-width", "60px");
    }
  };

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname?.startsWith(href);
  };

  if (isMobile) return null;

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-[70] h-screen bg-white dark:bg-gray-900 transition-all duration-300 flex flex-col border-r border-gray-200 dark:border-gray-700",
        isExpanded ? "w-[200px]" : "w-[60px]"
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Logo */}
      <div className={cn(
        "flex h-16 items-center border-b border-gray-200 dark:border-gray-700 transition-all duration-300",
        isExpanded ? "justify-between px-4" : "justify-center px-0"
      )}>
        <div className="relative w-full flex items-center justify-center">
          <Link
            href="/"
            className={cn(
              "absolute transition-all duration-300 flex items-center justify-center",
              isExpanded ? "opacity-0 scale-90 pointer-events-none" : "opacity-100 scale-100"
            )}
            aria-label="ApprovAI Admin home"
          >
            <Orb size="logo" static />
          </Link>
          <div className={cn(
            "absolute transition-all duration-300 w-full text-center",
            isExpanded ? "opacity-100 scale-100" : "opacity-0 scale-90"
          )}>
            <span className="font-[var(--font-inter-thin)] text-foreground uppercase text-lg" style={{ letterSpacing: "0.15em", fontWeight: 100 }}>
              ApprovAI
            </span>
            <span className="ml-1 text-xs font-semibold text-primary bg-primary/10 px-1.5 py-0.5 rounded">
              ADMIN
            </span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className={cn("flex-1 overflow-y-auto py-4 transition-all duration-300", isExpanded ? "px-2" : "px-0")}>
        <ul className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <li key={item.href}>
                <button
                  onClick={() => router.push(item.href)}
                  className={cn(
                    "flex items-center py-2.5 rounded-lg transition-all duration-300 relative w-full",
                    isExpanded ? "px-3 gap-3" : "px-0 justify-center gap-0",
                    active
                      ? "bg-gradient-to-r from-primary/15 to-primary/10 text-primary border-l-2 border-primary"
                      : "text-foreground/70 hover:bg-gradient-to-r hover:from-primary/20 hover:to-primary/10 hover:text-foreground hover:shadow-md hover:shadow-primary/10"
                  )}
                  title={!isExpanded ? item.label : ""}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <span className={cn(
                    "text-sm font-medium transition-all duration-300 whitespace-nowrap overflow-hidden",
                    isExpanded ? "opacity-100 w-auto" : "w-0 opacity-0"
                  )}>
                    {item.label}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className={cn(
        "border-t border-gray-200 dark:border-gray-700 space-y-1 transition-all duration-300 flex-shrink-0 mt-auto",
        isExpanded ? "p-2" : "py-2 px-0"
      )}>
        {isExpanded && admin && (
          <div className="mb-3 px-3 py-2 text-sm text-foreground/60 truncate flex items-center gap-2">
            <Shield className="w-3.5 h-3.5 text-primary flex-shrink-0" />
            {admin.authUser.email}
          </div>
        )}

        <button
          onClick={handleSignOut}
          className={cn(
            "flex items-center py-2.5 rounded-lg w-full text-foreground/70",
            "hover:bg-gradient-to-r hover:from-primary/20 hover:to-primary/10 hover:text-foreground hover:shadow-md hover:shadow-primary/10",
            "transition-all duration-300",
            isExpanded ? "px-3 gap-3" : "px-0 justify-center gap-0"
          )}
          title={!isExpanded ? "Sign Out" : ""}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          <span className={cn(
            "text-sm font-medium transition-all duration-300 whitespace-nowrap overflow-hidden",
            isExpanded ? "opacity-100 w-auto" : "w-0 opacity-0"
          )}>
            Sign Out
          </span>
        </button>
      </div>
    </aside>
  );
}
