// ---------------------------------------------------------------
// DEMO authentication, handled by the API. It is not production-grade:
// the session token is kept in localStorage, and accounts live in the
// server's memory, so they disappear when the server restarts.
// ---------------------------------------------------------------
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { ApiError } from "@/services/apiClient";
import * as userService from "@/services/userService";
import { loadFromStorage, saveToStorage, STORAGE_KEYS } from "@/lib/storage";
import type { AuthResult, User } from "@/types";

interface AuthContextValue {
  user: User | null;
  /** true once the saved session has been checked with the API */
  isReady: boolean;
  /** Returns the logged-in user, so the page can send admins to their dashboard. */
  login: (email: string, password: string) => Promise<User>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isReady, setIsReady] = useState(false);

  const endSession = useCallback(() => {
    setUser(null);
    saveToStorage(STORAGE_KEYS.session, null);
  }, []);

  const startSession = useCallback((session: AuthResult) => {
    saveToStorage(STORAGE_KEYS.session, session);
    setUser(session.user);
    return session.user;
  }, []);

  // Check the saved session once. A restarted API no longer knows the token.
  useEffect(() => {
    const session = loadFromStorage<AuthResult | null>(STORAGE_KEYS.session, null);
    if (!session) {
      setIsReady(true);
      return;
    }
    setUser(session.user);
    userService
      .getProfile()
      .then(setUser)
      .catch((error: unknown) => {
        if (error instanceof ApiError && error.status === 401) endSession();
      })
      .finally(() => setIsReady(true));
  }, [endSession]);

  const login = useCallback(
    async (email: string, password: string) => startSession(await userService.login(email, password)),
    [startSession]
  );

  const register = useCallback(
    async (name: string, email: string, password: string) => {
      startSession(await userService.register(name, email, password));
    },
    [startSession]
  );

  const logout = useCallback(() => {
    // The token must still be saved while this request is prepared.
    userService.logout().catch(() => undefined).finally(endSession);
  }, [endSession]);

  return (
    <AuthContext.Provider value={{ user, isReady, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside <AuthProvider>");
  return context;
}
