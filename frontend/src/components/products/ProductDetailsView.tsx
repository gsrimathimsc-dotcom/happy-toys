import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ChevronRight,
  CircleAlert,
  Heart,
  PackageCheck,
  RotateCcw,
  ShieldCheck,
  ShoppingCart,
  Truck,
  Zap,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { cn, formatPrice, getStockLabel } from "@/lib/utils";
import { ApiError } from "@/services/apiClient";
import { getProductDetails } from "@/services/productService";
import type { ProductDetails } from "@/types";
import NotFoundPage from "@/pages/NotFoundPage";
import Button from "@/components/ui/Button";
import PriceTag from "@/components/ui/PriceTag";
import QuantitySelector from "@/components/ui/QuantitySelector";
import Spinner from "@/components/ui/Spinner";
import StarRating from "@/components/ui/StarRating";
import ProductGrid from "./ProductGrid";

export default function ProductDetailsView({ productId }: { productId: string }) {
  const navigate = useNavigate();
  const { addToCart, getQuantity } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();

  const [data, setData] = useState<ProductDetails | null>(null);
  const [error, setError] = useState<ApiError | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [busy, setBusy] = useState<"cart" | "buy" | null>(null);

  useDocumentTitle(data?.product.name);

  useEffect(() => {
    let cancelled = false;
    setData(null);
    setError(null);
    setQuantity(1);
    getProductDetails(productId)
      .then((result) => {
        if (!cancelled) setData(result);
      })
      .catch((err: ApiError) => {
        if (!cancelled) setError(err);
      });
    return () => {
      cancelled = true;
    };
  }, [productId]);

  if (error?.status === 404) return <NotFoundPage />;

  if (error) {
    return (
      <div className="container-page flex flex-col items-center py-24 text-center">
        <CircleAlert className="h-12 w-12 text-red-500" />
        <p className="mt-4 text-lg font-semibold text-navy">{error.message}</p>
        <Button href="/products" className="mt-6">
          Back to products
        </Button>
      </div>
    );
  }

  if (!data) return <Spinner label="Loading product details..." />;

  const { product, related } = data;
  const inCart = getQuantity(product.id);
  const maxQuantity = Math.max(product.stockQuantity - inCart, 0);
  const saved = isWishlisted(product.id);
  // Never let the selected quantity go above what is still available.
  const selectedQuantity = Math.min(quantity, Math.max(maxQuantity, 1));

  const handleAddToCart = async () => {
    setBusy("cart");
    await addToCart(product.id, selectedQuantity);
    setBusy(null);
    setQuantity(1);
  };

  const handleBuyNow = async () => {
    setBusy("buy");
    // A toy already in the cart goes to checkout as it is, without adding more.
    const ready = inCart > 0 || (await addToCart(product.id, selectedQuantity));
    setBusy(null);
    if (ready) navigate("/checkout");
  };

  return (
    <div className="container-page py-8">
      {/* Breadcrumb */}
      <nav className="mb-6 flex flex-wrap items-center gap-1 text-sm text-muted" aria-label="Breadcrumb">
        <Link to="/" className="hover:text-primary">Home</Link>
        <ChevronRight className="h-4 w-4" />
        <Link to="/products" className="hover:text-primary">Products</Link>
        <ChevronRight className="h-4 w-4" />
        <Link to={`/products?category=${product.categoryId}`} className="hover:text-primary">
          {product.categoryName}
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="font-medium text-navy">{product.name}</span>
      </nav>

      <div className="grid animate-fade-in gap-10 lg:grid-cols-2">
        {/* Image */}
        <div className="relative overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm">
          {product.discountPercentage > 0 && (
            <span className="absolute left-5 top-5 z-10 rounded-full bg-accent px-3 py-1.5 text-sm font-bold text-white">
              {product.discountPercentage}% OFF
            </span>
          )}
          <img src={product.imageUrl} alt={product.name} className="aspect-square w-full object-cover" />
        </div>

        {/* Info */}
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">{product.brand}</p>
          <h1 className="mt-2 text-3xl font-extrabold leading-tight text-navy sm:text-4xl">{product.name}</h1>
          <div className="mt-3">
            <StarRating rating={product.rating} reviewCount={product.reviewCount} size="md" />
          </div>

          <div className="mt-6 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
            <PriceTag
              price={product.price}
              originalPrice={product.originalPrice}
              discount={product.discountPercentage}
              size="lg"
            />
            {product.originalPrice > product.price && (
              <p className="mt-1 text-sm font-medium text-green-600">
                You save {formatPrice(product.originalPrice - product.price)}
              </p>
            )}
            <p className="mt-1 text-xs text-muted">Inclusive of all taxes</p>
          </div>

          <p
            className={cn(
              "mt-5 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-semibold",
              product.stockStatus === "in-stock" && "bg-green-50 text-green-700",
              product.stockStatus === "low-stock" && "bg-orange-50 text-accent-dark",
              product.stockStatus === "out-of-stock" && "bg-red-50 text-red-600"
            )}
          >
            <PackageCheck className="h-4 w-4" />
            {getStockLabel(product.stockQuantity)}
          </p>

          <p className="mt-5 leading-relaxed text-slate-600">{product.description}</p>
          <p className="mt-3 text-sm">
            <span className="font-semibold text-navy">Recommended age:</span>{" "}
            <span className="text-muted">{product.ageGroup}</span>
          </p>

          {/* Actions */}
          {product.stockQuantity > 0 && (
            <div className="mt-6 space-y-4">
              <div className="flex flex-wrap items-center gap-4">
                <span className="text-sm font-semibold text-navy">Quantity</span>
                <QuantitySelector
                  value={selectedQuantity}
                  max={Math.max(maxQuantity, 1)}
                  onChange={setQuantity}
                />
                {inCart > 0 && (
                  <span className="text-sm text-muted">({inCart} already in your cart)</span>
                )}
              </div>
              <div className="flex flex-wrap gap-3">
                <Button
                  size="lg"
                  onClick={handleAddToCart}
                  isLoading={busy === "cart"}
                  disabled={busy !== null || maxQuantity === 0}
                  className="flex-1"
                >
                  {busy !== "cart" && <ShoppingCart className="h-5 w-5" />}
                  {maxQuantity === 0 ? "Max quantity in cart" : "Add to Cart"}
                </Button>
                <Button
                  size="lg"
                  variant="accent"
                  onClick={handleBuyNow}
                  isLoading={busy === "buy"}
                  disabled={busy !== null}
                  className="flex-1"
                >
                  {busy !== "buy" && <Zap className="h-5 w-5" />}
                  Buy Now
                </Button>
              </div>
            </div>
          )}

          <button
            onClick={() => toggleWishlist(product.id, product.name)}
            className={cn(
              "mt-4 inline-flex items-center gap-2 text-sm font-semibold transition",
              saved ? "text-red-500" : "text-muted hover:text-red-500"
            )}
          >
            <Heart className={cn("h-5 w-5", saved && "fill-red-500")} />
            {saved ? "Saved to wishlist" : "Add to wishlist"}
          </button>

          {/* Trust points */}
          <div className="mt-6 grid grid-cols-3 gap-3 border-t border-slate-100 pt-6 text-center text-xs text-muted">
            {[
              { icon: Truck, text: "Free delivery over ₹999" },
              { icon: RotateCcw, text: "7-day easy returns" },
              { icon: ShieldCheck, text: "Secure demo checkout" },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex flex-col items-center gap-2">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-light">
                  <Icon className="h-5 w-5 text-primary" />
                </span>
                {text}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Specifications */}
      <section className="mt-14 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm sm:p-8">
        <h2 className="text-2xl font-bold text-navy">Product Specifications</h2>
        <dl className="mt-5 divide-y divide-slate-100">
          {[
            ["Brand", product.brand],
            ["Category", product.categoryName],
            ["Age group", product.ageGroup],
            ...Object.entries(product.specifications),
          ].map(([label, value]) => (
            <div key={label} className="grid grid-cols-3 gap-4 py-3 text-sm">
              <dt className="font-semibold text-navy">{label}</dt>
              <dd className="col-span-2 text-slate-600">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Related products */}
      {related.length > 0 && (
        <section className="mt-14">
          <h2 className="mb-6 text-2xl font-bold text-navy">You may also like</h2>
          <ProductGrid products={related} />
        </section>
      )}
    </div>
  );
}
