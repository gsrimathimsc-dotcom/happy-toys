import { cn, formatPrice } from "@/lib/utils";

interface PriceTagProps {
  price: number;
  originalPrice: number;
  discount: number;
  size?: "sm" | "lg";
}

export default function PriceTag({ price, originalPrice, discount, size = "sm" }: PriceTagProps) {
  return (
    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
      <span className={cn("font-bold text-navy", size === "lg" ? "text-3xl" : "text-lg")}>
        {formatPrice(price)}
      </span>
      {originalPrice > price && (
        <>
          <span className={cn("text-muted line-through", size === "lg" ? "text-lg" : "text-sm")}>
            {formatPrice(originalPrice)}
          </span>
          <span
            className={cn(
              "font-semibold text-green-600",
              size === "lg" ? "text-base" : "text-xs"
            )}
          >
            {discount}% off
          </span>
        </>
      )}
    </div>
  );
}
