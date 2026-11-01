// Small, safe wrappers around the browser's localStorage.
// (localStorage can throw in private mode, or when it is full.)

export function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function saveToStorage<T>(key: string, value: T): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage full or blocked - the app still works, it just won't remember.
  }
}

// The cart, session and order keys are new because their saved shape changed
// when the app moved to the ASP.NET Core API. The wishlist still holds plain ids.
export const STORAGE_KEYS = {
  cart: "happy-toys-cart-v2",
  wishlist: "happy-toys-wishlist",
  session: "happy-toys-session",
  lastOrder: "happy-toys-last-order-v2",
} as const;
