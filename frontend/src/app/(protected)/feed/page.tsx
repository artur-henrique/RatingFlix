"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/features/auth/auth-context";
import { getFeed } from "@/features/social/api";
import { ReviewCard } from "@/features/reviews/review-card";
import { Button } from "@/components/ui/button";
import { QueryErrorNotice } from "@/components/shared/query-error-notice";

export default function FeedPage() {
  const { user, token } = useAuth();
  const [page, setPage] = useState(1);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["feed", page],
    queryFn: () => getFeed(page, token as string),
    enabled: !!token,
  });

  const reviews = data?.reviews;
  const totalPages = reviews ? Math.max(1, Math.ceil(reviews.total / reviews.perPage)) : 1;

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 p-8">
      <h1 className="text-2xl font-semibold">Feed</h1>

      {isLoading && <p className="text-muted-foreground">Carregando...</p>}

      {isError && <QueryErrorNotice onRetry={() => refetch()} />}

      {reviews && reviews.items.length === 0 && (
        <p className="text-muted-foreground">
          Você ainda não segue ninguém, ou quem você segue ainda não avaliou nada.
        </p>
      )}

      {reviews && reviews.items.length > 0 && (
        <div className="flex flex-col gap-4">
          {reviews.items.map((review) => (
            <ReviewCard key={review.id} review={review} isOwner={review.author.id === user?.id} showMovie />
          ))}
        </div>
      )}

      {reviews && reviews.total > reviews.perPage && (
        <div className="flex items-center justify-center gap-4">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            Anterior
          </Button>
          <span className="text-sm text-muted-foreground">
            Página {reviews.page} de {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Próxima
          </Button>
        </div>
      )}
    </main>
  );
}
