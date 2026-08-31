"use client";

import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@/features/auth/auth-context";
import { ApiError } from "@/lib/api-client";
import { StarRating } from "@/components/shared/star-rating";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { MediaType } from "@/features/catalog/types";
import { createReview, deleteReview, updateReview } from "./api";

const reviewSchema = z.object({
  rating: z.number().min(1, "Escolha uma nota de 1 a 5.").max(5),
  content: z.string().max(2000, "No máximo 2000 caracteres.").optional(),
});

type ReviewFormValues = z.infer<typeof reviewSchema>;

// Estrutural, não amarrado a Review nem ReviewWithAuthor: o formulário só
// precisa dos três campos abaixo, e ambos os tipos os satisfazem.
interface ExistingReview {
  id: string;
  rating: number;
  content: string | null;
}

interface ReviewFormProps {
  tmdbId: string;
  mediaType: MediaType;
  existingReview: ExistingReview | null;
  onSaved: () => void;
}

export function ReviewForm({ tmdbId, mediaType, existingReview, onSaved }: ReviewFormProps) {
  const { token } = useAuth();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      rating: existingReview?.rating ?? 0,
      content: existingReview?.content ?? "",
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (values: ReviewFormValues) => {
      if (!token) throw new Error("Não autenticado.");
      const content = values.content?.trim() || undefined;
      if (existingReview) {
        return updateReview(existingReview.id, { rating: values.rating, content }, token);
      }
      return createReview({ tmdbId, mediaType, rating: values.rating, content }, token);
    },
    onSuccess: () => {
      setFormError(null);
      onSaved();
    },
    onError: (err) => {
      setFormError(err instanceof ApiError ? err.message : "Não foi possível salvar sua crítica.");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!token || !existingReview) return;
      await deleteReview(existingReview.id, token);
    },
    onSuccess: onSaved,
  });

  return (
    <form
      onSubmit={handleSubmit((values) => saveMutation.mutate(values))}
      className="flex flex-col gap-3 rounded-lg border p-4"
    >
      <p className="text-sm font-medium">
        {existingReview ? "Sua crítica" : "Avaliar este título"}
      </p>

      <Controller
        control={control}
        name="rating"
        render={({ field }) => (
          <StarRating value={field.value} onChange={field.onChange} size={24} />
        )}
      />
      {errors.rating && <p className="text-sm text-destructive">{errors.rating.message}</p>}

      <Textarea
        placeholder="Escreva sua crítica (opcional)"
        rows={3}
        {...register("content")}
      />
      {errors.content && <p className="text-sm text-destructive">{errors.content.message}</p>}

      {formError && <p className="text-sm text-destructive">{formError}</p>}

      <div className="flex gap-2">
        <Button type="submit" disabled={isSubmitting || saveMutation.isPending}>
          {existingReview ? "Atualizar crítica" : "Publicar crítica"}
        </Button>
        {existingReview && (
          <Button
            type="button"
            variant="outline"
            disabled={deleteMutation.isPending}
            onClick={() => deleteMutation.mutate()}
          >
            Excluir
          </Button>
        )}
      </div>
    </form>
  );
}
