import type { MediaType } from "@/features/catalog/types";
import type { Paginated } from "@/lib/types";

export interface Badge {
  id: string;
  name: string;
  description: string;
  iconUrl: string;
}

export interface ProfileReview {
  id: string;
  userId: string;
  tmdbId: string;
  mediaType: MediaType;
  rating: number;
  content: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Profile {
  id: string;
  username: string;
  avatarUrl: string | null;
  createdAt: string;
  score: number;
  badges: Badge[];
}

export interface ProfileResponse {
  profile: Profile;
  reviews: Paginated<ProfileReview>;
}
