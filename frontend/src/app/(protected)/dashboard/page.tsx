"use client";

import Link from "next/link";
import { useAuth } from "@/features/auth/auth-context";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
      <h1 className="text-2xl font-semibold">Olá, {user?.username}</h1>
      <p className="text-muted-foreground">Veja o que os críticos que você segue andaram avaliando.</p>
      <Button render={<Link href="/feed">Ir para o feed</Link>} nativeButton={false} />
    </main>
  );
}
