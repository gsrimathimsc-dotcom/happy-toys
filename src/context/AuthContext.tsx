"use client";

// ---------------------------------------------------------------
// DEMO authentication only.
// Users are stored in the browser's localStorage - passwords are
// NOT secure here. A real app must use a proper auth provider and
// hash passwords on the server.
// ---------------------------------------------------------------
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { loadFromStorage, saveToStorage, STORAGE_KEYS } from "@/lib/storage";
import type { User } from "@/types";

interface StoredUser extends User {
  password: string;
}

interface AuthContextValue {
  user: User | null;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  register: (
    name: string,
    email: string,
    password: string
  ) => Promise<{ ok: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/** Fake network delay so the loading spinners are visible in the demo. */
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    setUser(loadFromStorage<User | null>(STORAGE_KEYS.user, null));
  }, []);

  const signIn = (u: User) => {
    setUser(u);
    saveToStorage(STORAGE_KEYS.user, u);
  };

  const login = useCallback(async (email: string, password: string) => {
    await wait(700);
    const users = loadFromStorage<StoredUser[]>(STORAGE_KEYS.registeredUsers, []);
    const found = users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());

    if (found && found.password !== password) {
      return { ok: false, error: "Incorrect password. Please try again." };
    }
    // Demo mode: unknown emails are allowed in, using the part before "@" as a name.
    const name = found?.name ?? email.split("@")[0];
    signIn({ name, email: email.trim() });
    return { ok: true };
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    await wait(800);
    const users = loadFromStorage<StoredUser[]>(STORAGE_KEYS.registeredUsers, []);
    if (users.some((u) => u.email.toLowerCase() === email.trim().toLowerCase())) {
      return { ok: false, error: "An account with this email already exists. Please log in." };
    }
    saveToStorage(STORAGE_KEYS.registeredUsers, [
      ...users,
      { name: name.trim(), email: email.trim(), password },
    ]);
    signIn({ name: name.trim(), email: email.trim() });
    return { ok: true };
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    saveToStorage(STORAGE_KEYS.user, null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside <AuthProvider>");
  return context;
}
