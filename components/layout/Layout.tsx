"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { SidebarProvider } from "./SidebarContext";
import { Header } from "./Header";
import { useAuth } from "@/lib/auth-context";
import { AuthSkeleton } from "@/components/skeletons/AuthSkeleton";

const PUBLIC_ROUTES = ["/login"];

function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { admin, loading } = useAuth();
  const isPublicRoute = PUBLIC_ROUTES.includes(pathname || "");

  if (isPublicRoute) {
    return <>{children}</>;
  }

  if (loading) {
    return <AuthSkeleton />;
  }

  if (!admin) {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden">
      <Sidebar />
      <div
        className="flex-1 flex flex-col min-w-0 min-h-0"
        style={{ marginLeft: "var(--sidebar-width, 60px)" }}
      >
        <Header />
        <main className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden bg-gray-50 dark:bg-gray-900 pt-14 md:pt-10">
          <div className="min-h-full">{children}</div>
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
