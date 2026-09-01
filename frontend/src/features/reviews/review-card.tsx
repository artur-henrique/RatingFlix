"use client";

import Image from "next/image";
import Link from "next/link";
import { StarRating } from "@/components/shared/star-rating";
import { useAuth } from "@/features/auth/auth-context";
import { VoteButtons } from "./vote-buttons";
import type { ReviewWithAuthor } from "./types";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR");
}

interface ReviewCardProps {
  review: ReviewWithAuthor;
  isOwner: boolean;
  // O filme já está óbvio pelo resto da tela na página do próprio filme;
  // só faz sentido repetir esse contexto em listagens que misturam títulos
  // diferentes, como o feed.
  showMovie?: boolean;
}

export function ReviewCard({ review, isOwner, showMovie = false }: ReviewCardProps) {
  const { status } = useAuth();
  const canVote = status === "authenticated" && !isOwner;

  return (
    <div className="flex flex-col gap-3 rounded-lg border p-4">
      {showMovie && review.movieTitle && (
        <Link
          href={`/movies/${review.mediaType}/${review.tmdbId}`}
          className="group flex items-center gap-3 border-b pb-3"
        >
          <div className="relative h-16 w-11 shrink-0 overflow-hidden rounded bg-muted">
            {review.moviePosterPath ? (
              <Image src={review.moviePosterPath} alt={review.movieTitle} fill sizes="44px" className="object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center p-1 text-center text-[10px] text-muted-foreground">
                Sem imagem
              </div>
            )}
          </div>
          <span className="font-medium group-hover:underline">{review.movieTitle}</span>
        </Link>
      )}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href={`/profiles/${review.author.username}`} className="font-medium hover:underline">
              {review.author.username}
            </Link>
            {isOwner && (
              <span className="rounded-full bg-secondary px-2 py-0.5 text-xs text-secondary-foreground">
                Sua crítica
              </span>
            )}
          </div>
          <span className="text-xs text-muted-foreground">{formatDate(review.createdAt)}</span>
        </div>
        <StarRating value={review.rating} />
        {review.content && <p className="text-sm">{review.content}</p>}
        <VoteButtons reviewId={review.id} votes={review.votes} canVote={canVote} />
      </div>
    </div>
  );
}
