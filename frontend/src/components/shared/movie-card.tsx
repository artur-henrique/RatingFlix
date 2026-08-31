import Image from "next/image";
import Link from "next/link";
import type { SearchResult } from "@/features/catalog/types";

export function MovieCard({ movie }: { movie: SearchResult }) {
  const year = movie.releaseDate ? movie.releaseDate.slice(0, 4) : null;

  return (
    <Link href={`/movies/${movie.mediaType}/${movie.id}`} className="group flex flex-col gap-2">
      <div className="relative aspect-2/3 overflow-hidden rounded-lg bg-muted">
        {movie.posterPath ? (
          <Image
            src={movie.posterPath}
            alt={movie.title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw"
            className="object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center p-2 text-center text-xs text-muted-foreground">
            Sem imagem
          </div>
        )}
      </div>
      <div>
        <p className="line-clamp-2 text-sm font-medium">{movie.title}</p>
        {year && <p className="text-xs text-muted-foreground">{year}</p>}
      </div>
    </Link>
  );
}
