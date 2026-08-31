"use client";

import Link from "next/link";
import { useAuth } from "@/features/auth/auth-context";
import { Button } from "@/components/ui/button";

export default function Page() {
  const { user, status } = useAuth();

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
      <h1 className="text-3xl font-semibold tracking-tight">RatingFlix</h1>
      <p className="max-w-md text-muted-foreground">
        {status === "authenticated"
          ? `Olá, ${user?.username}. O que você quer avaliar hoje?`
          : "Avalie, descubra e discuta filmes e séries com outros críticos."}
      </p>
      <Button render={<Link href="/search">Buscar filmes e séries</Link>} nativeButton={false} />
    </main>
  );
}
