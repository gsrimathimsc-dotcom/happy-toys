"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { loadFromStorage, saveToStorage, STORAGE_KEYS } from "@/lib/storage";
import { useToast } from "./ToastContext";

interface WishlistContextValue {
  /** Product IDs in the wishlist */
  ids: string[];
  isWishlisted: (productId: string) => boolean;
  toggleWishlist: (productId: string, productName: string) => void;
}

const WishlistContext = createContext<WishlistContextValue | undefined>(undefined);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { showToast } = useToast();
  const [ids, setIds] = useState<string[]>([]);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setIds(loadFromStorage<string[]>(STORAGE_KEYS.wishlist, []));
    setIsReady(true);
  }, []);

  useEffect(() => {
    if (isReady) saveToStorage(STORAGE_KEYS.wishlist, ids);
  }, [ids, isReady]);

  const isWishlisted = useCallback((productId: string) => ids.includes(productId), [ids]);

  const toggleWishlist = useCallback(
    (productId: string, productName: string) => {
      const removing = ids.includes(productId);
      setIds((current) =>
        removing ? current.filter((id) => id !== productId) : [...current, productId]
      );
      showToast(
        removing ? `${productName} removed from wishlist` : `${productName} saved to wishlist`,
        removing ? "info" : "success"
      );
    },
    [ids, showToast]
  );

  return (
    <WishlistContext.Provider value={{ ids, isWishlisted, toggleWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist(): WishlistContextValue {
  const context = useContext(WishlistContext);
  if (!context) throw new Error("useWishlist must be used inside <WishlistProvider>");
  return context;
}
