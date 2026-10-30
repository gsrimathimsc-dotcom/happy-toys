// GET /api/products
// Optional query params: ?category=soft-toys&q=bear&minPrice=100&maxPrice=2000&sort=price-asc&limit=8
import { fail, ok } from "@/lib/apiResponse";
import { getProducts, parseProductQuery } from "@/lib/productService";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = parseProductQuery(searchParams);
    const products = getProducts(query);
    return ok(products);
  } catch (error) {
    console.error("GET /api/products failed:", error);
    return fail("Could not load products. Please try again.", 500);
  }
}
