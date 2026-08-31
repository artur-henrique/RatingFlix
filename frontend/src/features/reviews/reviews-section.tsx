"use client";

import Link from "next/link";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/features/auth/auth-context";
import { Button } from "@/components/ui/button";
import { QueryErrorNotice } from "@/components/shared/query-error-notice";
import type { MediaType } from "@/features/catalog/types";
import { getMovieReviews } from "./api";
import { ReviewCard } from "./review-card";
import { ReviewForm } from "./review-form";

interface ReviewsSectionProps {
  tmdbId: string;
  mediaType: MediaType;
}

export function ReviewsSection({ tmdbId, mediaType }: ReviewsSectionProps) {
  const { user, status } = useAuth();
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();

  const baseKey = ["movie-reviews", tmdbId, mediaType] as const;

  const listQuery = useQuery({
    queryKey: [...baseKey, page],
    queryFn: () => getMovieReviews(tmdbId, mediaType, page),
  });

  // Sempre olha a página 1 pra descobrir se o usuário já tem uma crítica
  // neste título — mesma queryKey da listagem quando page === 1, então o
  // TanStack Query reaproveita o cache sem duplicar a chamada.
  const myReviewQuery = useQuery({
    queryKey: [...baseKey, 1],
    queryFn: () => getMovieReviews(tmdbId, mediaType, 1),
    enabled: status === "authenticated",
  });

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: baseKey });
  }

  const reviews = listQuery.data?.reviews;
  const myReview =
    myReviewQuery.data?.reviews.items.find((review) => review.author.id === user?.id) ?? null;

  const totalPages = reviews ? Math.max(1, Math.ceil(reviews.total / reviews.perPage)) : 1;

  return (
    <section className="flex flex-col gap-6">
      <h2 className="text-xl font-semibold">Críticas</h2>

      {status === "authenticated" && (
        <ReviewForm
          key={myReview?.id ?? "new"}
          tmdbId={tmdbId}
          mediaType={mediaType}
          existingReview={myReview}
          onSaved={invalidate}
        />
      )}

      {status === "unauthenticated" && (
        <p className="text-sm text-muted-foreground">
          <Link href="/login" className="underline underline-offset-4">
            Entre
          </Link>{" "}
          para avaliar este título.
        </p>
      )}

      {listQuery.isLoading && <p className="text-muted-foreground">Carregando críticas...</p>}

      {listQuery.isError && <QueryErrorNotice onRetry={() => listQuery.refetch()} />}

      {reviews && reviews.items.length === 0 && (
        <p className="text-muted-foreground">Ainda não há críticas para este título.</p>
      )}

      {reviews && reviews.items.length > 0 && (
        <div className="flex flex-col gap-4">
          {reviews.items.map((review) => (
            <ReviewCard key={review.id} review={review} isOwner={review.author.id === user?.id} />
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
    </section>
  );
}
