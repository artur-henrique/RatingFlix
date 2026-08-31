import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  value: number;
  onChange?: (value: number) => void;
  size?: number;
}

// Um único componente para os dois casos: passe onChange para virar um input
// clicável (formulário de review), omita para virar só exibição (cards de review).
export function StarRating({ value, onChange, size = 20 }: StarRatingProps) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= value;
        const icon = (
          <Star
            size={size}
            className={cn(filled ? "fill-primary text-primary" : "fill-transparent text-muted-foreground")}
          />
        );

        if (!onChange) {
          return <span key={star}>{icon}</span>;
        }

        return (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            aria-label={`${star} estrela${star > 1 ? "s" : ""}`}
          >
            {icon}
          </button>
        );
      })}
    </div>
  );
}
