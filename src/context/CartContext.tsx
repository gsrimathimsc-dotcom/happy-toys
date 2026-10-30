"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { apiFetch } from "@/lib/api";
import { loadFromStorage, saveToStorage, STORAGE_KEYS } from "@/lib/storage";
import { calculateTotals } from "@/lib/utils";
import type { CartItem, CartTotals } from "@/types";
import { useToast } from "./ToastContext";

interface CartContextValue {
  items: CartItem[];
  totals: CartTotals;
  /** true once the saved cart has been loaded from localStorage */
  isReady: boolean;
  /** Validates with POST /api/cart, then adds. Returns true on success. */
  addToCart: (productId: string, quantity?: number) => Promise<boolean>;
  updateQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  getQuantity: (productId: string) => number;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const { showToast } = useToast();
  const [items, setItems] = useState<CartItem[]>([]);
  const [isReady, setIsReady] = useState(false);

  // 1. Load the saved cart once, in the browser.
  useEffect(() => {
    setItems(loadFromStorage<CartItem[]>(STORAGE_KEYS.cart, []));
    setIsReady(true);
  }, []);

  // 2. Save the cart whenever it changes (after the first load).
  useEffect(() => {
    if (isReady) saveToStorage(STORAGE_KEYS.cart, items);
  }, [items, isReady]);

  const getQuantity = useCallback(
    (productId: string) => items.find((i) => i.productId === productId)?.quantity ?? 0,
    [items]
  );

  const addToCart = useCallback(
    async (productId: string, quantity = 1) => {
      const alreadyInCart = getQuantity(productId);
      try {
        // Ask the backend to validate the product and stock.
        const item = await apiFetch<CartItem>("/api/cart", {
          method: "POST",
          body: JSON.stringify({ productId, quantity: alreadyInCart + quantity }),
        });

        setItems((current) => {
          const exists = current.some((i) => i.productId === productId);
          return exists
            ? current.map((i) => (i.productId === productId ? item : i))
            : [...current, item];
        });
        showToast(`${item.name} added to cart`, "success");
        return true;
      } catch (error) {
        showToast(error instanceof Error ? error.message : "Could not add to cart", "error");
        return false;
      }
    },
    [getQuantity, showToast]
  );

  const updateQuantity = useCallback(
    (productId: string, quantity: number) => {
      const item = items.find((i) => i.productId === productId);
      if (!item) return;
      if (quantity > item.stock) {
        showToast(`Only ${item.stock} units available`, "info");
      }
      const safeQuantity = Math.min(quantity, item.stock);
      setItems((current) =>
        safeQuantity <= 0
          ? current.filter((i) => i.productId !== productId)
          : current.map((i) => (i.productId === productId ? { ...i, quantity: safeQuantity } : i))
      );
    },
    [items, showToast]
  );

  const removeFromCart = useCallback(
    (productId: string) => {
      setItems((current) => current.filter((i) => i.productId !== productId));
      showToast("Item removed from cart", "info");
    },
    [showToast]
  );

  const clearCart = useCallback(() => setItems([]), []);

  const totals = useMemo(() => calculateTotals(items), [items]);

  return (
    <CartContext.Provider
      value={{
        items,
        totals,
        isReady,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        getQuantity,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used inside <CartProvider>");
  return context;
}
