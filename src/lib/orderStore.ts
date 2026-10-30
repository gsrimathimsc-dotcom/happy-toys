// ---------------------------------------------------------------
// In-memory order storage (DEMO ONLY - there is no database).
//
// Orders live in the server's memory. They are LOST when you stop
// or restart the server (e.g. Ctrl+C then `npm run dev` again).
//
// We keep the Map on `globalThis` so it survives Next.js hot reloads
// while you edit code in development.
// ---------------------------------------------------------------
import type { Order } from "@/types";

const globalForOrders = globalThis as unknown as {
  happyToysOrders?: Map<string, Order>;
};

const orders: Map<string, Order> =
  globalForOrders.happyToysOrders ?? new Map<string, Order>();

globalForOrders.happyToysOrders = orders;

export function saveOrder(order: Order): void {
  orders.set(order.orderId, order);
}

export function findOrder(orderId: string): Order | undefined {
  return orders.get(orderId);
}
