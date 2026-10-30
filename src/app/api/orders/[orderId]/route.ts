// GET /api/orders/:orderId  ->  order details (DEMO, in-memory)
import { fail, ok } from "@/lib/apiResponse";
import { findOrder } from "@/lib/orderStore";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ orderId: string }> }
) {
  const { orderId } = await params;
  const order = findOrder(orderId);

  if (!order) {
    return fail(
      "Order not found. Demo orders are kept in memory and are cleared when the server restarts.",
      404
    );
  }

  return ok(order);
}
