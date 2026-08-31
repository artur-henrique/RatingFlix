import { searchMovies } from "@/features/catalog/api";
import { MovieCard } from "@/components/shared/movie-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface SearchPageProps {
  searchParams: Promise<{ query?: string }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { query } = await searchParams;
  const trimmedQuery = query?.trim() ?? "";

  const results = trimmedQuery ? (await searchMovies(trimmedQuery)).movies : [];

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 p-8">
      <h1 className="text-2xl font-semibold">Buscar filmes e séries</h1>

      {/* Sem onSubmit/useState de propósito: um <form method="get"> nativo já
          atualiza a URL (?query=...) e recarrega esta Server Component com o
          novo searchParams — sem precisar de nenhum JS no cliente. */}
      <form className="flex gap-2">
        <Input
          name="query"
          defaultValue={trimmedQuery}
          placeholder="Nome do filme ou série"
          aria-label="Buscar filmes e séries"
        />
        <Button type="submit">Buscar</Button>
      </form>

      {!trimmedQuery && <p className="text-muted-foreground">Digite algo para buscar.</p>}

      {trimmedQuery && results.length === 0 && (
        <p className="text-muted-foreground">Nenhum resultado para &quot;{trimmedQuery}&quot;.</p>
      )}

      {results.length > 0 && (
        <>
          <p className="text-sm text-muted-foreground">
            Mostrando os primeiros {results.length} resultados.
          </p>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {results.map((movie) => (
              <MovieCard key={`${movie.mediaType}-${movie.id}`} movie={movie} />
            ))}
          </div>
        </>
      )}
    </main>
  );
}
