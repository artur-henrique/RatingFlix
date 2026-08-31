import { notFound } from "next/navigation";
import Image from "next/image";
import { getMovieDetails } from "@/features/catalog/api";
import { ApiError } from "@/lib/api-client";
import type { MediaType } from "@/features/catalog/types";
import { ReviewsSection } from "@/features/reviews/reviews-section";

interface MovieDetailsPageProps {
  params: Promise<{ mediaType: string; id: string }>;
}

export default async function MovieDetailsPage({ params }: MovieDetailsPageProps) {
  const { mediaType, id } = await params;

  if (mediaType !== "movie" && mediaType !== "tv") {
    notFound();
  }

  const movie = await getMovieDetails(mediaType as MediaType, id)
    .then((response) => response.movie)
    .catch((err) => {
      if (err instanceof ApiError && err.status === 404) {
        notFound();
      }
      throw err;
    });

  const year = movie.releaseDate ? movie.releaseDate.slice(0, 4) : null;

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 p-8">
      <div className="flex flex-col gap-6 sm:flex-row">
        <div className="relative aspect-2/3 w-full max-w-[240px] shrink-0 overflow-hidden rounded-lg bg-muted">
          {movie.posterPath ? (
            <Image
              src={movie.posterPath}
              alt={movie.title}
              fill
              sizes="240px"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
              Sem imagem
            </div>
          )}
        </div>
        <div className="flex flex-col gap-3">
          <h1 className="text-3xl font-semibold">{movie.title}</h1>
          <p className="text-sm text-muted-foreground">
            {year ?? "Data desconhecida"} · Nota TMDB: {movie.voteAverage.toFixed(1)}
          </p>
          <p>{movie.overview || "Sem sinopse disponível."}</p>
        </div>
      </div>

      <ReviewsSection tmdbId={movie.id} mediaType={mediaType as MediaType} />
    </main>
  );
}
