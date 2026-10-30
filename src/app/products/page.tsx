import { Suspense } from "react";
import type { Metadata } from "next";
import { getCategories } from "@/lib/productService";
import ProductsView from "@/components/products/ProductsView";
import Spinner from "@/components/ui/Spinner";

export const metadata: Metadata = { title: "Shop All Toys" };

export default function ProductsPage() {
  // ProductsView reads the URL (useSearchParams), so Next.js needs a Suspense boundary.
  return (
    <Suspense fallback={<Spinner label="Loading products..." />}>
      <ProductsView categories={getCategories()} />
    </Suspense>
  );
}
