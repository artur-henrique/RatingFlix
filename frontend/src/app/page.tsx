"use client";

import { Search } from "lucide-react";
import { useAuth } from "@/features/auth/auth-context";
import { Input } from "@/components/ui/input";

export default function Page() {
  const { user, status } = useAuth();

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-12 p-8 text-center">
      {/* Grid de uma coluna só: sem largura própria definida, a coluna se
          ajusta ao filho mais largo (o h1). Com o alinhamento padrão do
          grid (stretch), o formulário de busca "estica" pra ocupar essa
          mesma largura — fica com exatamente o width do título, sem medir
          nada via JS. */}
      <div className="grid gap-8">
        <h1 className="text-4xl font-semibold tracking-tight sm:text-6xl md:text-7xl">
          RatingFlix
        </h1>
        <form action="/search" className="relative">
          <Input
            type="search"
            name="query"
            placeholder="Buscar filmes e séries"
            aria-label="Buscar filmes e séries"
            className="h-12 rounded-full pr-12"
          />
          <button
            type="submit"
            aria-label="Buscar"
            className="absolute inset-y-0 right-0 flex items-center rounded-r-full px-4 text-muted-foreground outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <Search className="h-5 w-5" />
          </button>
        </form>
      </div>
      <p className="max-w-md text-muted-foreground">
        {status === "authenticated"
          ? `Olá, ${user?.username}. O que você quer avaliar hoje?`
          : "Avalie, descubra e discuta filmes e séries com outros críticos."}
      </p>
    </main>
  );
}
