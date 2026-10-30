import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  rating: number;
  reviewCount?: number;
  size?: "sm" | "md";
}

export default function StarRating({ rating, reviewCount, size = "sm" }: StarRatingProps) {
  const iconSize = size === "sm" ? "h-3.5 w-3.5" : "h-5 w-5";
  return (
    <div className="flex items-center gap-1.5" aria-label={`Rated ${rating} out of 5`}>
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={cn(
              iconSize,
              star <= Math.round(rating)
                ? "fill-secondary text-secondary"
                : "fill-slate-200 text-slate-200"
            )}
          />
        ))}
      </div>
      <span className={cn("font-semibold text-navy", size === "sm" ? "text-xs" : "text-sm")}>
        {rating.toFixed(1)}
      </span>
      {reviewCount !== undefined && (
        <span className={cn("text-muted", size === "sm" ? "text-xs" : "text-sm")}>
          ({reviewCount.toLocaleString("en-IN")})
        </span>
      )}
    </div>
  );
}
