"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { SidebarProvider } from "./SidebarContext";
import { Header } from "./Header";
import { ThemeToggle } from "./ThemeToggle";
import { useAuth } from "@/lib/auth-context";
import { AuthSkeleton } from "@/components/skeletons/AuthSkeleton";
import { adminShellInner, adminShellOuter } from "@/lib/themed-surfaces";
import { cn } from "@/lib/utils";

const PUBLIC_ROUTES = ["/login", "/reset-password"];

function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { admin, loading } = useAuth();
  const isPublicRoute = PUBLIC_ROUTES.includes(pathname || "");

  useEffect(() => {
    if (!isPublicRoute && !loading && !admin) {
      router.replace("/login");
    }
  }, [admin, loading, isPublicRoute, router]);

  if (isPublicRoute) {
    return <>{children}</>;
  }

  if (loading) {
    return <AuthSkeleton />;
  }

  if (!admin) {
    return <AuthSkeleton />;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#e5e5e5] dark:bg-black">
      <Sidebar />
      <div
        className="flex min-h-0 min-w-0 flex-1 flex-col"
        style={{ marginLeft: "var(--sidebar-width, 72px)" }}
      >
        <Header hideOnDesktop />
        <main className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto bg-[#e5e5e5] pt-14 dark:bg-black md:pb-6 md:pr-6 md:pt-6">
          <div className={cn(adminShellOuter)}>
            <div className={cn(adminShellInner)}>
              <div className="hidden shrink-0 items-center justify-end px-5 pt-5 md:flex sm:px-8 sm:pt-6">
                <ThemeToggle />
              </div>
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <LayoutContent>{children}</LayoutContent>
    </SidebarProvider>
  );
}
