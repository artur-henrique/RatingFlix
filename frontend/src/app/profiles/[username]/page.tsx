import { notFound } from "next/navigation";
import Link from "next/link";
import { getUserProfile } from "@/features/profile/api";
import { getMovieDetails } from "@/features/catalog/api";
import { ApiError } from "@/lib/api-client";
import { ProfileReviewItem } from "@/features/profile/profile-review-item";
import { FollowButton } from "@/features/social/follow-button";
import { Button } from "@/components/ui/button";

interface ProfilePageProps {
  params: Promise<{ username: string }>;
  searchParams: Promise<{ page?: string }>;
}

export default async function ProfilePage({ params, searchParams }: ProfilePageProps) {
  const { username } = await params;
  const { page: pageParam } = await searchParams;
  const page = Number(pageParam) > 0 ? Number(pageParam) : 1;

  const { profile, reviews } = await getUserProfile(username, page).catch((err) => {
    if (err instanceof ApiError && err.status === 404) {
      notFound();
    }
    throw err;
  });

  // Busca os detalhes de cada filme em paralelo — a review só tem o tmdbId,
  // e mostrar uma lista de IDs sem título/pôster não diz nada pro usuário.
  const movies = await Promise.all(
    reviews.items.map((review) =>
      getMovieDetails(review.mediaType, review.tmdbId)
        .then((response) => response.movie)
        .catch(() => null)
    )
  );

  const totalPages = Math.max(1, Math.ceil(reviews.total / reviews.perPage));

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 p-8">
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-semibold">{profile.username}</h1>
          <p className="text-sm text-muted-foreground">Score de reputação: {profile.score}</p>
        </div>
        <FollowButton profileUserId={profile.id} profileUsername={profile.username} />
      </div>

      {profile.badges.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {profile.badges.map((badge) => (
            <span
              key={badge.id}
              title={badge.description}
              className="rounded-full bg-secondary px-3 py-1 text-xs text-secondary-foreground"
            >
              {badge.name}
            </span>
          ))}
        </div>
      )}

      <div className="flex flex-col gap-3">
        <h2 className="text-xl font-semibold">Críticas ({reviews.total})</h2>

        {reviews.items.length === 0 && (
          <p className="text-muted-foreground">{profile.username} ainda não avaliou nada.</p>
        )}

        {reviews.items.map((review, index) => (
          <ProfileReviewItem key={review.id} review={review} movie={movies[index]} />
        ))}
      </div>

      {reviews.total > reviews.perPage && (
        <div className="flex items-center justify-center gap-4">
          {page > 1 ? (
            <Button
              variant="outline"
              size="sm"
              render={<Link href={`?page=${page - 1}`}>Anterior</Link>}
              nativeButton={false}
            />
          ) : (
            <Button variant="outline" size="sm" disabled>
              Anterior
            </Button>
          )}
          <span className="text-sm text-muted-foreground">
            Página {reviews.page} de {totalPages}
          </span>
          {page < totalPages ? (
            <Button
              variant="outline"
              size="sm"
              render={<Link href={`?page=${page + 1}`}>Próxima</Link>}
              nativeButton={false}
            />
          ) : (
            <Button variant="outline" size="sm" disabled>
              Próxima
            </Button>
          )}
        </div>
      )}
    </main>
  );
}
