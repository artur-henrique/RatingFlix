"use client";

import Link from "next/link";
import { StarRating } from "@/components/shared/star-rating";
import { useAuth } from "@/features/auth/auth-context";
import { VoteButtons } from "./vote-buttons";
import type { ReviewWithAuthor } from "./types";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR");
}

export function ReviewCard({ review, isOwner }: { review: ReviewWithAuthor; isOwner: boolean }) {
  const { status } = useAuth();
  const canVote = status === "authenticated" && !isOwner;

  return (
    <div className="flex flex-col gap-2 rounded-lg border p-4">
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
  );
}
