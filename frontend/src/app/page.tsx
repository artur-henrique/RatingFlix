"use client";

import Link from "next/link";
import { useAuth } from "@/features/auth/auth-context";
import { Button } from "@/components/ui/button";

export default function Page() {
  const { user, status, logout } = useAuth();

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
      <h1 className="text-3xl font-semibold tracking-tight">RatingFlix</h1>
      <p className="max-w-md text-muted-foreground">
        Avalie, descubra e discuta filmes e séries com outros críticos.
      </p>
      <Button render={<Link href="/search">Buscar filmes e séries</Link>} nativeButton={false} />
      {status === "authenticated" ? (
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">Olá, {user?.username}</span>
          <Button
            render={<Link href="/dashboard">Minha conta</Link>}
            variant="outline"
            nativeButton={false}
          />
          <Button variant="ghost" onClick={logout}>
            Sair
          </Button>
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <Button render={<Link href="/login">Entrar</Link>} nativeButton={false} />
          <Button
            render={<Link href="/register">Criar conta</Link>}
            variant="outline"
            nativeButton={false}
          />
        </div>
      )}
    </main>
  );
}
