"use client";

import { useAuth } from "@/features/auth/auth-context";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  const { user, logout } = useAuth();

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
      <h1 className="text-2xl font-semibold">Olá, {user?.username}</h1>
      <p className="text-muted-foreground">
        Área autenticada — o feed de reviews chega na Etapa 6.
      </p>
      <Button variant="outline" onClick={logout}>
        Sair
      </Button>
    </main>
  );
}
