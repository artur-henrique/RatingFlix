import { randomUUID } from "node:crypto";

export interface VoteProps {
  id?: string;
  userId: string;
  reviewId: string;
  type: "upvote" | "downvote";
  createdAt?: Date;
}

export class Vote {
  private props: Required<VoteProps>;

  constructor(props: VoteProps) {
    this.props = {
      id: props.id ?? randomUUID(),
      userId: props.userId,
      reviewId: props.reviewId,
      type: props.type,
      createdAt: props.createdAt ?? new Date(),
    };
  }

  get id() {
    return this.props.id;
  }

  get userId() {
    return this.props.userId;
  }

  get reviewId() {
    return this.props.reviewId;
  }

  get type() {
    return this.props.type;
  }

  get createdAt() {
    return this.props.createdAt;
  }
}
