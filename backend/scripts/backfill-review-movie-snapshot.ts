// Preenche movieTitle/moviePosterPath das reviews criadas antes da migration
// que introduziu esse snapshot (Etapa 9). Idempotente: só toca reviews com
// movieTitle nulo, então pode ser rodado de novo sem efeito colateral.
import { prisma } from "../src/shared/infra/database/prisma.js";
import { TmdbMovieService } from "../src/infra/services/tmdb-movie-service.js";

async function main() {
  const movieService = new TmdbMovieService();

  const pending = await prisma.review.findMany({
    where: { movieTitle: null },
    select: { id: true, tmdbId: true, mediaType: true },
  });

  if (pending.length === 0) {
    console.log("Nenhuma review pendente de backfill.");
    return;
  }

  const uniquePairs = new Map<string, { tmdbId: string; mediaType: "movie" | "tv" }>();
  for (const review of pending) {
    const mediaType = review.mediaType as "movie" | "tv";
    uniquePairs.set(`${mediaType}:${review.tmdbId}`, { tmdbId: review.tmdbId, mediaType });
  }

  console.log(`${pending.length} review(s) pendente(s), ${uniquePairs.size} filme(s)/série(s) único(s) a consultar.`);

  const details = new Map<string, { title: string; posterPath: string | null } | null>();
  for (const [key, pair] of uniquePairs) {
    try {
      const movie = await movieService.getMovieDetails(pair.tmdbId, pair.mediaType);
      details.set(key, movie ? { title: movie.title, posterPath: movie.posterPath } : null);
      console.log(`  ${key} -> ${movie ? movie.title : "não encontrado no TMDB"}`);
    } catch (error) {
      details.set(key, null);
      console.error(`  ${key} -> falhou:`, error);
    }
  }

  let updated = 0;
  for (const review of pending) {
    const mediaType = review.mediaType as "movie" | "tv";
    const key = `${mediaType}:${review.tmdbId}`;
    const movie = details.get(key);
    if (!movie) continue;

    await prisma.review.update({
      where: { id: review.id },
      data: { movieTitle: movie.title, moviePosterPath: movie.posterPath },
    });
    updated++;
  }

  console.log(`${updated}/${pending.length} review(s) atualizada(s).`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
