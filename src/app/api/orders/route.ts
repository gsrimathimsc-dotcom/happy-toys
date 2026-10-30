// POST /api/orders  (DEMO checkout)
// Body: { customer: {...}, paymentMethod: "upi", items: [{ productId, quantity }] }
//
// Prices are re-calculated on the server from our product data, so a
// user cannot change prices in the browser. The order is saved in
// memory only (see src/lib/orderStore.ts).
import { fail, ok } from "@/lib/apiResponse";
import { saveOrder } from "@/lib/orderStore";
import { getProductById } from "@/lib/productService";
import { calculateTotals, generateOrderId, validators } from "@/lib/utils";
import type { CustomerDetails, Order, OrderItem, PaymentMethod } from "@/types";

const PAYMENT_METHODS: PaymentMethod[] = ["upi", "card", "netbanking", "cod"];

interface OrderBody {
  customer?: Partial<CustomerDetails>;
  paymentMethod?: string;
  items?: { productId?: string; quantity?: number }[];
}

function validateCustomer(c: Partial<CustomerDetails> | undefined): string | null {
  if (!c) return "Customer details are required.";
  if (!validators.required(c.name ?? "")) return "Name is required.";
  if (!validators.email(c.email ?? "")) return "A valid email is required.";
  if (!validators.mobile(c.mobile ?? "")) return "A valid 10-digit mobile number is required.";
  if (!validators.required(c.address ?? "")) return "Delivery address is required.";
  if (!validators.required(c.city ?? "")) return "City is required.";
  if (!validators.pinCode(c.pinCode ?? "")) return "A valid 6-digit PIN code is required.";
  return null;
}

export async function POST(request: Request) {
  let body: OrderBody;
  try {
    body = (await request.json()) as OrderBody;
  } catch {
    return fail("Request body must be valid JSON.");
  }

  const customerError = validateCustomer(body.customer);
  if (customerError) return fail(customerError);

  const paymentMethod = body.paymentMethod as PaymentMethod;
  if (!PAYMENT_METHODS.includes(paymentMethod)) {
    return fail("Please choose a payment method.");
  }

  if (!Array.isArray(body.items) || body.items.length === 0) {
    return fail("Your cart is empty.");
  }

  // Rebuild every line item from trusted server data.
  const items: (OrderItem & { originalPrice: number })[] = [];
  for (const line of body.items) {
    const product = getProductById(String(line.productId ?? ""));
    const quantity = Number(line.quantity);
    if (!product) return fail("One of the products in your cart no longer exists.", 404);
    if (!Number.isInteger(quantity) || quantity < 1) {
      return fail(`Invalid quantity for ${product.name}.`);
    }
    if (quantity > product.stock) {
      return fail(`Sorry, only ${product.stock} units of ${product.name} are available.`, 409);
    }
    items.push({
      productId: product.id,
      name: product.name,
      image: product.image,
      price: product.price,
      originalPrice: product.originalPrice,
      quantity,
    });
  }

  const customer = body.customer as CustomerDetails;
  const order: Order = {
    orderId: generateOrderId(),
    createdAt: new Date().toISOString(),
    customer: {
      name: customer.name.trim(),
      email: customer.email.trim(),
      mobile: customer.mobile.trim(),
      address: customer.address.trim(),
      city: customer.city.trim(),
      pinCode: customer.pinCode.trim(),
    },
    paymentMethod,
    items: items.map(({ originalPrice: _omit, ...item }) => item),
    totals: calculateTotals(items),
    status: "confirmed",
  };

  saveOrder(order);
  return ok(order, 201);
}
