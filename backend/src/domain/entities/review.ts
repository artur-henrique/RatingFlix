import { randomUUID } from "node:crypto";

export interface ReviewProps {
  id?: string;
  userId: string;
  tmdbId: string;
  mediaType: "movie" | "tv";
  rating: number; // 1 to 5
  content?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Review {
  private props: Required<ReviewProps>;

  constructor(props: ReviewProps) {
    if (props.rating < 1 || props.rating > 5) {
      throw new Error("Rating must be between 1 and 5.");
    }

    this.props = {
      id: props.id ?? randomUUID(),
      userId: props.userId,
      tmdbId: props.tmdbId,
      mediaType: props.mediaType,
      rating: props.rating,
      content: props.content ?? null,
      createdAt: props.createdAt ?? new Date(),
      updatedAt: props.updatedAt ?? new Date(),
    };
  }

  get id() {
    return this.props.id;
  }

  get userId() {
    return this.props.userId;
  }

  get tmdbId() {
    return this.props.tmdbId;
  }

  get mediaType() {
    return this.props.mediaType;
  }

  get rating() {
    return this.props.rating;
  }

  get content() {
    return this.props.content;
  }

  get createdAt() {
    return this.props.createdAt;
  }

  get updatedAt() {
    return this.props.updatedAt;
  }

  updateRatingAndContent(rating: number, content?: string | null) {
    if (rating < 1 || rating > 5) {
      throw new Error("Rating must be between 1 and 5.");
    }
    this.props.rating = rating;
    this.props.content = content ?? null;
    this.props.updatedAt = new Date();
  }
}
