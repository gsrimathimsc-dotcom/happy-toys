import { Link } from "react-router-dom";
import type { Category } from "@/types";
import { cn } from "@/lib/utils";
import CategoryIcon, { getCategoryColor } from "@/components/ui/CategoryIcon";

export default function CategoryCard({ category }: { category: Category }) {
  return (
    <Link
      to={`/products?category=${category.id}`}
      className="group flex flex-col items-center gap-3 rounded-2xl border border-slate-100 bg-white p-5 text-center shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg"
    >
      <div
        className={cn(
          "flex h-16 w-16 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3",
          getCategoryColor(category.id)
        )}
      >
        <CategoryIcon slug={category.id} className="h-8 w-8" />
      </div>
      <div>
        <h3 className="font-semibold text-navy group-hover:text-primary">{category.name}</h3>
        <p className="mt-0.5 text-xs text-muted">{category.productCount} products</p>
      </div>
    </Link>
  );
}
