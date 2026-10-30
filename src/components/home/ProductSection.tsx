import type { Product } from "@/types";
import ProductGrid from "@/components/products/ProductGrid";
import SectionHeading from "@/components/ui/SectionHeading";

interface ProductSectionProps {
  title: string;
  subtitle?: string;
  products: Product[];
  linkHref?: string;
}

/** Reused for Featured, Best Sellers, New Arrivals and Special Offers. */
export default function ProductSection({ title, subtitle, products, linkHref }: ProductSectionProps) {
  if (products.length === 0) return null;
  return (
    <section className="container-page pt-16">
      <SectionHeading
        title={title}
        subtitle={subtitle}
        linkLabel={linkHref ? "See all" : undefined}
        linkHref={linkHref}
      />
      <ProductGrid products={products} />
    </section>
  );
}
