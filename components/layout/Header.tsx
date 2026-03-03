"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "@/lib/theme-context";
import { useAuth } from "@/lib/auth-context";
import { Orb } from "@/components/orb/Orb";
import {
  Sun, Moon, Menu, X, LogOut, Shield,
  LayoutDashboard, Users, MailPlus, FolderKanban,
  Building2, FileSearch, Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

type NavItem = {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
};

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Users", href: "/users", icon: Users },
  { label: "Early Access", href: "/early-access", icon: MailPlus },
  { label: "Projects", href: "/projects", icon: FolderKanban },
  { label: "Municipalities", href: "/municipalities", icon: Building2 },
  { label: "Blueprints", href: "/blueprints", icon: FileSearch },
  { label: "Settings", href: "/settings", icon: Settings },
];

export function Header() {
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
      const clickedHamburger = navButtonRef.current && navButtonRef.current.contains(target);
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
      <header className="fixed top-0 left-0 right-0 h-14 md:h-10 md:min-h-[40px] md:max-h-[40px] bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-3 sm:px-5 z-[60]">
        {/* Mobile: Orb logo */}
        <Link href="/" className="md:hidden flex items-center" aria-label="Admin home">
          <Orb size="logo" static />
        </Link>

        {/* Admin badge - desktop */}
        <div className="hidden md:flex items-center gap-1.5 ml-[var(--sidebar-width,60px)]">
          <Shield className="w-3.5 h-3.5 text-primary" />
          <span className="text-xs font-semibold text-primary">ADMIN</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Mobile hamburger */}
          <button
            type="button"
            onClick={() => setIsNavOpen((prev) => !prev)}
            ref={navButtonRef}
            className="md:hidden p-2.5 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label="Open navigation menu"
            aria-expanded={isNavOpen}
          >
            {isNavOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          {/* Theme toggle - desktop */}
          <button
            onClick={toggleTheme}
            className={cn(
              "hidden md:flex w-[22px] h-[22px] bg-gray-100 dark:bg-white/5 backdrop-blur-md rounded-[5px] items-center justify-center transition-all duration-300",
              "shadow-[0_2px_8px_rgba(0,0,0,0.1)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.4)]",
              "text-gray-500 dark:text-gray-400",
              "hover:bg-gray-200 dark:hover:bg-white/10 hover:shadow-[0_4px_12px_rgba(59,130,246,0.2)] hover:-translate-y-0.5",
              "hover:text-gray-600 dark:hover:text-gray-300",
              "focus:outline-none focus:shadow-[0_0_0_2px_rgb(59,130,246),0_0_0_4px_rgba(59,130,246,0.2)]"
            )}
            aria-label="Toggle theme"
            title={theme === "dark" ? "Light Mode" : "Dark Mode"}
          >
            <Sun className={cn("h-3.5 w-3.5 transition-all", theme === "dark" ? "rotate-0 scale-100" : "rotate-90 scale-0 absolute")} />
            <Moon className={cn("h-3.5 w-3.5 transition-all", theme === "light" ? "rotate-0 scale-100" : "rotate-90 scale-0 absolute")} />
          </button>
        </div>
      </header>

      {/* Mobile nav drawer */}
      {isNavOpen && (
        <>
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[70] md:hidden" onClick={() => setIsNavOpen(false)} aria-hidden="true" />
          <aside
            ref={navRef}
            className="fixed right-0 top-0 h-full w-72 bg-white dark:bg-gray-900 shadow-2xl z-[80] md:hidden flex flex-col border-l border-gray-200 dark:border-gray-700 overflow-hidden"
            role="dialog"
            aria-label="Admin navigation"
          >
            <div className="flex h-14 items-center justify-between px-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-primary" />
                <h2 className="text-base font-semibold text-gray-900 dark:text-white">Admin</h2>
              </div>
              <button
                type="button"
                onClick={() => setIsNavOpen(false)}
                className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                aria-label="Close navigation"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {admin?.authUser.email && (
              <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{admin.authUser.email}</p>
              </div>
            )}

            <nav className="flex-1 overflow-y-auto py-3 px-2">
              <ul className="space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const active = item.href === "/" ? pathname === "/" : (pathname || "").startsWith(item.href);
                  return (
                    <li key={item.href}>
                      <button
                        type="button"
                        onClick={() => handleNavigate(item.href)}
                        className={cn(
                          "w-full flex items-center py-3 px-3 rounded-lg transition-all duration-200",
                          active
                            ? "bg-primary/10 text-primary border-r-2 border-primary"
                            : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                        )}
                      >
                        <Icon className="w-5 h-5 flex-shrink-0" />
                        <span className="text-sm font-medium ml-3">{item.label}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </nav>

            <div className="border-t border-gray-200 dark:border-gray-700 flex-shrink-0 p-2">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={toggleTheme}
                  className="flex flex-col items-center justify-center py-3 px-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  aria-label="Toggle theme"
                >
                  {theme === "dark" ? <Sun className="w-5 h-5 mb-1" /> : <Moon className="w-5 h-5 mb-1" />}
                  <span className="text-xs font-medium">{theme === "dark" ? "Light" : "Dark"}</span>
                </button>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="flex flex-col items-center justify-center py-3 px-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <LogOut className="w-5 h-5 mb-1" />
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
