"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "@/lib/theme-context";
import { useAuth } from "@/lib/auth-context";
import {
  Sun,
  Moon,
  Menu,
  X,
  LogOut,
  Shield,
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
} from "lucide-react";
import { cn } from "@/lib/utils";

type NavItem = {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
};

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

interface HeaderProps {
  hideOnDesktop?: boolean;
}

export function Header({ hideOnDesktop = false }: HeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const { signOut, admin } = useAuth();
  const [isNavOpen, setIsNavOpen] = React.useState(false);
  const navRef = React.useRef<HTMLDivElement>(null);
  const navButtonRef = React.useRef<HTMLButtonElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const clickedHamburger =
        navButtonRef.current && navButtonRef.current.contains(target);
      if (!clickedHamburger && navRef.current && !navRef.current.contains(target)) {
        setIsNavOpen(false);
      }
    };

    if (isNavOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isNavOpen]);

  React.useEffect(() => {
    setIsNavOpen(false);
  }, [pathname]);

  const handleNavigate = (href: string) => {
    router.push(href);
    setIsNavOpen(false);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      setIsNavOpen(false);
      router.push("/login");
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-[60] flex h-14 items-center justify-between border-b border-[#d4d4d4] bg-white/80 px-3 backdrop-blur-xl dark:border-[#333333] dark:bg-black/80 sm:px-5",
          hideOnDesktop && "md:hidden"
        )}
      >
        <Link href="/" className="flex items-center gap-2" aria-label="Admin home">
          <img
            src="/ant.png"
            alt=""
            width={36}
            height={20}
            className="h-5 w-auto object-contain"
          />
          <span className="text-sm font-semibold text-[#1a1a1a] dark:text-white">Admin</span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsNavOpen((prev) => !prev)}
            ref={navButtonRef}
            className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-[10px] p-2.5 text-[#666666] transition-colors hover:bg-[#f0f0f0] dark:text-[#7f7f7f] dark:hover:bg-[#1a1a1a]"
            aria-label="Open navigation menu"
            aria-expanded={isNavOpen}
          >
            {isNavOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </header>

      {isNavOpen && (
        <>
          <div
            className="fixed inset-0 z-[70] bg-black/40 backdrop-blur-sm md:hidden"
            onClick={() => setIsNavOpen(false)}
            aria-hidden="true"
          />
          <aside
            ref={navRef}
            className="fixed right-0 top-0 z-[80] flex h-full w-72 flex-col overflow-hidden border-l border-[#d4d4d4] bg-[#f7f7f7] shadow-2xl dark:border-[#333333] dark:bg-[#0d0d0d] md:hidden"
            role="dialog"
            aria-label="Admin navigation"
          >
            <div className="flex h-14 shrink-0 items-center justify-between border-b border-[#d4d4d4] px-4 dark:border-[#333333]">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-[#1f81df]" />
                <h2 className="text-base font-semibold text-[#1a1a1a] dark:text-white">Admin</h2>
              </div>
              <button
                type="button"
                onClick={() => setIsNavOpen(false)}
                className="rounded-[10px] p-2 text-[#666666] hover:bg-[#f0f0f0] dark:text-[#7f7f7f] dark:hover:bg-[#1a1a1a]"
                aria-label="Close navigation"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {admin?.authUser.email && (
              <div className="shrink-0 border-b border-[#d4d4d4] px-4 py-2 dark:border-[#333333]">
                <p className="truncate text-xs text-[#666666] dark:text-[#7f7f7f]">
                  {admin.authUser.email}
                </p>
              </div>
            )}

            <nav className="flex-1 overflow-y-auto px-2 py-3">
              <ul className="space-y-0.5">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const active =
                    item.href === "/"
                      ? pathname === "/"
                      : (pathname || "").startsWith(item.href);
                  return (
                    <li key={item.href}>
                      <button
                        type="button"
                        onClick={() => handleNavigate(item.href)}
                        className={cn(
                          "flex w-full items-center rounded-[14px] px-3 py-3 transition-colors",
                          active
                            ? "border-l border-[#1f81df] bg-white text-[#1f81df] dark:bg-[#1a1a1a] dark:text-white"
                            : "text-[#666666] hover:bg-[#f0f0f0] dark:text-[#7f7f7f] dark:hover:bg-[#1a1a1a]"
                        )}
                      >
                        <Icon className="h-[18px] w-[18px] shrink-0" strokeWidth={1.75} />
                        <span className="ml-3 text-sm font-medium">{item.label}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </nav>

            <div className="shrink-0 border-t border-[#d4d4d4] p-2 dark:border-[#333333]">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={toggleTheme}
                  className="flex flex-col items-center justify-center rounded-[14px] px-2 py-3 text-[#666666] hover:bg-[#f0f0f0] dark:text-[#7f7f7f] dark:hover:bg-[#1a1a1a]"
                  aria-label="Toggle theme"
                >
                  {theme === "dark" ? (
                    <Sun className="mb-1 h-5 w-5" />
                  ) : (
                    <Moon className="mb-1 h-5 w-5" />
                  )}
                  <span className="text-xs font-medium">
                    {theme === "dark" ? "Light" : "Dark"}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="flex flex-col items-center justify-center rounded-[14px] px-2 py-3 text-[#666666] hover:bg-[#f0f0f0] dark:text-[#7f7f7f] dark:hover:bg-[#1a1a1a]"
                >
                  <LogOut className="mb-1 h-5 w-5" />
                  <span className="text-xs font-medium">Sign out</span>
                </button>
              </div>
            </div>
          </aside>
        </>
      )}
    </>
  );
}
