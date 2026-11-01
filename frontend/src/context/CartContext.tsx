// ---------------------------------------------------------------
// The cart lives in the browser (localStorage). The API checks it
// against current prices and stock, on load and before checkout.
// ---------------------------------------------------------------
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { validateCart } from "@/services/cartService";
import { loadFromStorage, saveToStorage, STORAGE_KEYS } from "@/lib/storage";
import { calculateTotals } from "@/lib/utils";
import type { CartItem, CartTotals } from "@/types";
import { useToast } from "./ToastContext";

interface CartContextValue {
  items: CartItem[];
  totals: CartTotals;
  /** Checks the stock with the API, then adds. Returns true on success. */
  addToCart: (productId: string, quantity?: number) => Promise<boolean>;
  updateQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  getQuantity: (productId: string) => number;
  /** Replaces saved prices and stock with the current ones. */
  syncCart: () => Promise<void>;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

const toLine = (item: CartItem) => ({ productId: item.productId, quantity: item.quantity });

export function CartProvider({ children }: { children: ReactNode }) {
  const { showToast } = useToast();
  const [items, setItems] = useState<CartItem[]>(() =>
    loadFromStorage<CartItem[]>(STORAGE_KEYS.cart, [])
  );

  // Lets syncCart read the latest cart without changing on every update.
  const itemsRef = useRef(items);
  itemsRef.current = items;

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.cart, items);
  }, [items]);

  const syncCart = useCallback(async () => {
    if (itemsRef.current.length === 0) return;
    try {
      const result = await validateCart(itemsRef.current.map(toLine));
      setItems(result.items);
      result.issues.forEach((issue) => showToast(issue, "info"));
    } catch {
      // API unreachable: keep the saved cart. The order step checks it again.
    }
  }, [showToast]);

  useEffect(() => {
    void syncCart();
  }, [syncCart]);

  const getQuantity = useCallback(
    (productId: string) => items.find((i) => i.productId === productId)?.quantity ?? 0,
    [items]
  );

  const addToCart = useCallback(
    async (productId: string, quantity = 1) => {
      const requested = getQuantity(productId) + quantity;
      try {
        const result = await validateCart([{ productId, quantity: requested }]);
        const item = result.items[0];
        if (!item) {
          showToast(result.issues[0] ?? "This toy is not available.", "error");
          return false;
        }
        if (item.quantity < requested) {
          showToast(`Only ${item.stockQuantity} units of ${item.name} are available.`, "error");
          return false;
        }

        setItems((current) =>
          current.some((i) => i.productId === productId)
            ? current.map((i) => (i.productId === productId ? item : i))
            : [...current, item]
        );
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
      if (quantity > item.stockQuantity) {
        showToast(`Only ${item.stockQuantity} units available`, "info");
      }
      const safeQuantity = Math.min(quantity, item.stockQuantity);
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
      value={{ items, totals, addToCart, updateQuantity, removeFromCart, clearCart, getQuantity, syncCart }}
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
