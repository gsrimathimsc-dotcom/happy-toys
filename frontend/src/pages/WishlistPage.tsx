import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { useWishlist } from "@/context/WishlistContext";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { getProducts } from "@/services/productService";
import type { Product } from "@/types";
import ProductGrid from "@/components/products/ProductGrid";
import EmptyState from "@/components/ui/EmptyState";
import Spinner from "@/components/ui/Spinner";
import HomeLink from "@/components/ui/HomeLink";

export default function WishlistPage() {
  useDocumentTitle("My Wishlist");
  const { ids } = useWishlist();
  const [allProducts, setAllProducts] = useState<Product[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getProducts()
      .then((result) => setAllProducts(result.items))
      .catch((err: Error) => setError(err.message));
  }, []);

  if (error) return <p className="container-page py-16 text-center font-medium text-red-600">{error}</p>;
  if (!allProducts) return <Spinner label="Loading your wishlist..." />;

  const products = allProducts.filter((p) => ids.includes(p.id));

  return (
    <div className="container-page py-8">
      <HomeLink className="mb-2" />
      <h1 className="mb-6 text-2xl font-extrabold sm:text-3xl tracking-tight text-navy">
        My Wishlist <span className="text-lg font-semibold text-muted">({products.length})</span>
      </h1>
      {products.length === 0 ? (
        <EmptyState
          icon={Heart}
          title="Your wishlist is empty"
          message="Tap the heart icon on any toy to save it here for later."
          actionLabel="Discover Toys"
          actionHref="/products"
        />
      ) : (
        <ProductGrid products={products} />
      )}
    </div>
  );
}
