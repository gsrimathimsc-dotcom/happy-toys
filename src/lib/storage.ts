// Small, safe wrappers around the browser's localStorage.
// (localStorage does not exist on the server, and can throw in private mode.)

export function loadFromStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function saveToStorage<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage full or blocked - the app still works, it just won't remember.
  }
}

export const STORAGE_KEYS = {
  cart: "happy-toys-cart",
  wishlist: "happy-toys-wishlist",
  user: "happy-toys-user",
  registeredUsers: "happy-toys-registered-users",
  lastOrder: "happy-toys-last-order",
} as const;
