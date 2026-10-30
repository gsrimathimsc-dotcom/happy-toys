import { countProductsInCategory, getCategories } from "@/lib/productService";
import CategoryCard from "@/components/products/CategoryCard";
import SectionHeading from "@/components/ui/SectionHeading";

export default function CategoriesSection() {
  const categories = getCategories();
  return (
    <section className="container-page pt-16">
      <SectionHeading
        title="Shop by Category"
        subtitle="Find the perfect toy for every age and interest"
        linkLabel="View all toys"
        linkHref="/products"
      />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-5">
        {categories.map((category) => (
          <CategoryCard
            key={category.slug}
            category={category}
            count={countProductsInCategory(category.slug)}
          />
        ))}
      </div>
    </section>
  );
}
