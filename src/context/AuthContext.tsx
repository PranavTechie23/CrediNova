import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { User } from "@/types";

const AUTH_STORAGE_KEY = "credit_clarity_auth";

function loadUser(): User | null {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed?.email && parsed?.id) return parsed as User;
    return null;
  } catch {
    return null;
  }
}

function saveUser(user: User | null) {
  if (user) {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  }
}

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setUser(loadUser());
    setHydrated(true);
  }, []);

  const login = useCallback(async (email: string, _password: string) => {
    await new Promise((r) => setTimeout(r, 400));
    const u: User = { email, id: `user-${Date.now()}` };
    setUser(u);
    saveUser(u);
  }, []);

  const signup = useCallback(async (email: string, _password: string, name?: string) => {
    await new Promise((r) => setTimeout(r, 400));
    const u: User = { email, id: `user-${Date.now()}`, ...(name ? { name } : {}) };
    setUser(u);
    saveUser(u);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    saveUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: !!user,
      login,
      signup,
      logout,
    }),
    [user, login, signup, logout]
  );

  if (!hydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
