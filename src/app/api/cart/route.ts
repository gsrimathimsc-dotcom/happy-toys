// POST /api/cart  (DEMO)
// Body: { "productId": "p1", "quantity": 2 }
//
// The cart itself is kept in the browser (React Context + localStorage).
// This endpoint shows how a backend would VALIDATE an "add to cart"
// request: does the product exist, and is there enough stock?
import { fail, ok } from "@/lib/apiResponse";
import { getProductById } from "@/lib/productService";
import { productToCartItem } from "@/lib/utils";

interface AddToCartBody {
  productId?: unknown;
  quantity?: unknown;
}

export async function POST(request: Request) {
  let body: AddToCartBody;
  try {
    body = (await request.json()) as AddToCartBody;
  } catch {
    return fail("Request body must be valid JSON.");
  }

  const productId = typeof body.productId === "string" ? body.productId : "";
  const quantity = Number(body.quantity ?? 1);

  if (!productId) return fail("productId is required.");
  if (!Number.isInteger(quantity) || quantity < 1) {
    return fail("Quantity must be a whole number of at least 1.");
  }

  const product = getProductById(productId);
  if (!product) return fail("This product no longer exists.", 404);
  if (product.stock === 0) return fail(`${product.name} is out of stock.`, 409);
  if (quantity > product.stock) {
    return fail(`Only ${product.stock} units of ${product.name} are available.`, 409);
  }

  return ok(productToCartItem(product, quantity), 201);
}
