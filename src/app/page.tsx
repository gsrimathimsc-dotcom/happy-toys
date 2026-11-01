import {
  getBestSellers,
  getFeaturedProducts,
  getNewArrivals,
  getSpecialOffers,
} from "@/lib/productService";
import CategoriesSection from "@/components/home/CategoriesSection";
import HeroBanner from "@/components/home/HeroBanner";
import Newsletter from "@/components/home/Newsletter";
import OfferBanner from "@/components/home/OfferBanner";
import ProductSection from "@/components/home/ProductSection";
import Testimonials from "@/components/home/Testimonials";

export default function HomePage() {
  return (
    <>
      <HeroBanner />
      <CategoriesSection />
      <ProductSection
        title="Featured Toys"
        subtitle="Handpicked favourites for curious minds"
        products={getFeaturedProducts(4)}
        linkHref="/products"
      />
      <OfferBanner />
      <ProductSection
        title="Best Sellers"
        subtitle="The toys families love the most"
        products={getBestSellers(4)}
        linkHref="/products?sort=popularity"
      />
      <ProductSection
        title="New Arrivals"
        subtitle="Fresh picks just added to the store"
        products={getNewArrivals(4)}
        linkHref="/products?sort=newest"
      />
      <ProductSection
        title="Special Offers"
        subtitle="Our biggest discounts right now"
        products={getSpecialOffers(4)}
      />
      <Testimonials />
      <Newsletter />
    </>
  );
}
