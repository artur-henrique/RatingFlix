"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/auth-context";

// Guard client-side, não Next.js Middleware: o Middleware roda no Edge,
// antes de qualquer render, e só enxerga cookies — nunca localStorage.
// Como o token vive em localStorage (ADR-002), só um componente que roda
// no navegador consegue checar a sessão.
export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { status } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    }
  }, [status, router]);

  if (status !== "authenticated") {
    return null;
  }

  return <>{children}</>;
}
