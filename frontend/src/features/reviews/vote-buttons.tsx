"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { ThumbsDown, ThumbsUp } from "lucide-react";
import { useAuth } from "@/features/auth/auth-context";
import { cn } from "@/lib/utils";
import { voteOnReview } from "./api";
import type { ReviewVotes } from "./types";

function applyVoteResult(
  current: ReviewVotes,
  result: { voted: boolean; type: "upvote" | "downvote" | null }
): ReviewVotes {
  const next = { ...current };
  if (current.myVote === "upvote") next.upvotes -= 1;
  if (current.myVote === "downvote") next.downvotes -= 1;
  if (result.type === "upvote") next.upvotes += 1;
  if (result.type === "downvote") next.downvotes += 1;
  next.myVote = result.type;
  return next;
}

interface VoteButtonsProps {
  reviewId: string;
  votes: ReviewVotes;
  canVote: boolean;
}

// Estado local, não invalidação de query: a resposta do toggle já diz tudo
// que precisamos pra recalcular upvotes/downvotes/myVote, sem precisar
// buscar nada de novo — e este componente é usado em dois lugares com
// queries diferentes (reviews do filme, feed), então acoplar a uma
// invalidação específica de cada contexto pioraria a reutilização.
export function VoteButtons({ reviewId, votes: initialVotes, canVote }: VoteButtonsProps) {
  const { token } = useAuth();
  const [votes, setVotes] = useState(initialVotes);

  const mutation = useMutation({
    mutationFn: (type: "upvote" | "downvote") => voteOnReview(reviewId, type, token as string),
    onSuccess: (result) => {
      setVotes((current) => applyVoteResult(current, result));
    },
  });

  if (!canVote) {
    return (
      <div className="flex items-center gap-3 text-sm text-muted-foreground">
        <span className="flex items-center gap-1">
          <ThumbsUp size={14} /> {votes.upvotes}
        </span>
        <span className="flex items-center gap-1">
          <ThumbsDown size={14} /> {votes.downvotes}
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 text-sm">
      <button
        type="button"
        disabled={mutation.isPending}
        onClick={() => mutation.mutate("upvote")}
        className={cn(
          "flex items-center gap-1 rounded-sm text-muted-foreground outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50",
          votes.myVote === "upvote" && "font-medium text-primary hover:text-primary"
        )}
        aria-pressed={votes.myVote === "upvote"}
        aria-label="Votar a favor"
      >
        <ThumbsUp size={14} /> {votes.upvotes}
      </button>
      <button
        type="button"
        disabled={mutation.isPending}
        onClick={() => mutation.mutate("downvote")}
        className={cn(
          "flex items-center gap-1 rounded-sm text-muted-foreground outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50",
          votes.myVote === "downvote" && "font-medium text-destructive hover:text-destructive"
        )}
        aria-pressed={votes.myVote === "downvote"}
        aria-label="Votar contra"
      >
        <ThumbsDown size={14} /> {votes.downvotes}
      </button>
    </div>
  );
}
