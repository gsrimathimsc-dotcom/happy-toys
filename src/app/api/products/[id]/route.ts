// GET /api/products/:id  ->  one product plus related products
import { fail, ok } from "@/lib/apiResponse";
import { getProductById, getRelatedProducts } from "@/lib/productService";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const product = getProductById(id);

  if (!product) {
    return fail(`Product "${id}" was not found.`, 404);
  }

  return ok({ product, related: getRelatedProducts(product) });
}
