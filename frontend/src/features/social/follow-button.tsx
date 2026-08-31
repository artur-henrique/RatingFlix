"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/features/auth/auth-context";
import { getUserProfile } from "@/features/profile/api";
import { Button } from "@/components/ui/button";
import { toggleFollow } from "./api";

interface FollowButtonProps {
  profileUserId: string;
  profileUsername: string;
}

export function FollowButton({ profileUserId, profileUsername }: FollowButtonProps) {
  const { user, token, status } = useAuth();
  const queryClient = useQueryClient();

  const isOwnProfile = user?.id === profileUserId;
  const followQueryKey = ["profile-follow-status", profileUsername] as const;

  // A página de perfil é um Server Component (ADR-003) e o token só existe
  // no localStorage do navegador (ADR-002) — o SSR nunca sabe quem está
  // olhando, então `profile.isFollowing` sempre chega null nele. Só depois
  // de hidratar, com o token em mãos, dá pra saber o estado real — daí essa
  // segunda busca, só quando faz sentido (tem alguém logado, e não é o
  // próprio dono do perfil).
  const followQuery = useQuery({
    queryKey: followQueryKey,
    queryFn: () =>
      getUserProfile(profileUsername, 1, token).then((response) => response.profile.isFollowing),
    enabled: status === "authenticated" && !isOwnProfile,
  });

  const mutation = useMutation({
    mutationFn: () => toggleFollow(profileUserId, token as string),
    onSuccess: (result) => {
      queryClient.setQueryData(followQueryKey, result.following);
    },
  });

  if (status !== "authenticated" || isOwnProfile) {
    return null;
  }

  const isFollowing = followQuery.data ?? false;

  return (
    <Button
      variant={isFollowing ? "outline" : "default"}
      disabled={followQuery.isLoading || mutation.isPending}
      onClick={() => mutation.mutate()}
    >
      {isFollowing ? "Deixar de seguir" : "Seguir"}
    </Button>
  );
}
