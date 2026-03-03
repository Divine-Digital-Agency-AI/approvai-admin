"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { AuthSkeleton } from "@/components/skeletons/AuthSkeleton";

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const { admin, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !admin) {
      router.push("/login");
    }
  }, [admin, loading, router]);

  if (loading) {
    return <AuthSkeleton />;
  }

  if (!admin) {
    return null;
  }

  return <>{children}</>;
}
