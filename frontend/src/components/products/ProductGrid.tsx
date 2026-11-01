import type { Product } from "@/types";
import ProductCard from "./ProductCard";

/** Responsive grid: 2 columns on mobile, up to 4 on desktop. */
export default function ProductGrid({ products }: { products: Product[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 xl:grid-cols-4">
      {products.map((product, index) => (
        <div
          key={product.id}
          className="animate-slide-up"
          style={{ animationDelay: `${Math.min(index, 8) * 50}ms` }}
        >
          <ProductCard product={product} />
        </div>
      ))}
    </div>
  );
}
