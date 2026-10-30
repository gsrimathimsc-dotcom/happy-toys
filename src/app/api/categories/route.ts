// GET /api/categories  ->  all categories with a product count
import { ok } from "@/lib/apiResponse";
import { countProductsInCategory, getCategories } from "@/lib/productService";

export async function GET() {
  const categories = getCategories().map((category) => ({
    ...category,
    productCount: countProductsInCategory(category.slug),
  }));
  return ok(categories);
}
