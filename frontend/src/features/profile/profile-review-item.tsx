import Image from "next/image";
import Link from "next/link";
import { StarRating } from "@/components/shared/star-rating";
import type { MovieDetails } from "@/features/catalog/types";
import type { ProfileReview } from "./types";

interface ProfileReviewItemProps {
  review: ProfileReview;
  movie: MovieDetails | null;
}

export function ProfileReviewItem({ review, movie }: ProfileReviewItemProps) {
  return (
    <Link
      href={`/movies/${review.mediaType}/${review.tmdbId}`}
      className="flex gap-4 rounded-lg border p-4 hover:bg-muted/50"
    >
      <div className="relative aspect-2/3 w-16 shrink-0 overflow-hidden rounded bg-muted">
        {movie?.posterPath ? (
          <Image src={movie.posterPath} alt={movie.title} fill sizes="64px" className="object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center p-1 text-center text-[10px] text-muted-foreground">
            Sem imagem
          </div>
        )}
      </div>
      <div className="flex flex-col gap-1">
        <p className="font-medium">{movie?.title ?? "Título indisponível"}</p>
        <StarRating value={review.rating} size={16} />
        {review.content && (
          <p className="line-clamp-2 text-sm text-muted-foreground">{review.content}</p>
        )}
      </div>
    </Link>
  );
}
