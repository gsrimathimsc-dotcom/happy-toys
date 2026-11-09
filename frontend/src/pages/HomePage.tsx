import { useEffect, useState } from "react";
import { CircleAlert } from "lucide-react";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { getCollection } from "@/services/productService";
import type { Product } from "@/types";
import CategoriesSection from "@/components/home/CategoriesSection";
import HeroBanner from "@/components/home/HeroBanner";
import Newsletter from "@/components/home/Newsletter";
import OfferBanner from "@/components/home/OfferBanner";
import ProductSection from "@/components/home/ProductSection";
import Testimonials from "@/components/home/Testimonials";
import Button from "@/components/ui/Button";
import Reveal from "@/components/ui/Reveal";
import Spinner from "@/components/ui/Spinner";

interface HomeProducts {
  featured: Product[];
  bestSellers: Product[];
  newArrivals: Product[];
  offers: Product[];
}

export default function HomePage() {
  useDocumentTitle();
  const [products, setProducts] = useState<HomeProducts | null>(null);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setError("");
    Promise.all([
      getCollection("featured"),
      getCollection("best-sellers"),
      getCollection("new-arrivals"),
      getCollection("offers"),
    ])
      .then(([featured, bestSellers, newArrivals, offers]) => {
        if (!cancelled) setProducts({ featured, bestSellers, newArrivals, offers });
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message);
      });
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  return (
    <>
      <HeroBanner />
      <Reveal><CategoriesSection /></Reveal>
      {error ? (
        <div className="container-page flex flex-col items-center pt-16 text-center">
          <CircleAlert className="h-10 w-10 text-red-500" />
          <p className="mt-3 font-semibold text-red-700">{error}</p>
          <Button className="mt-5" onClick={() => setReloadKey((k) => k + 1)}>
            Try again
          </Button>
        </div>
      ) : !products ? (
        <Spinner label="Finding the best toys..." />
      ) : (
        <>
          <ProductSection
            title="Featured Toys"
            subtitle="Handpicked favourites for curious minds"
            products={products.featured}
            linkHref="/products"
          />
          <Reveal><OfferBanner /></Reveal>
          <ProductSection
            title="Best Sellers"
            subtitle="The toys families love the most"
            products={products.bestSellers}
            linkHref="/products?sort=popularity"
          />
          <ProductSection
            title="New Arrivals"
            subtitle="Fresh picks just added to the store"
            products={products.newArrivals}
            linkHref="/products?sort=newest"
          />
          <ProductSection
            title="Special Offers"
            subtitle="Our biggest discounts right now"
            products={products.offers}
          />
        </>
      )}
      <Reveal><Testimonials /></Reveal>
      <Reveal><Newsletter /></Reveal>
    </>
  );
}
