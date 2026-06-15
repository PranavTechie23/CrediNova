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
import { loginUser, signupUser, fetchAuthenticatedUser } from "@/services/authService";

const AUTH_STORAGE_KEY = "credit_clarity_auth";
const AUTH_TOKEN_KEY = "credit_clarity_token";

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

function loadToken(): string | null {
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

function saveToken(token: string | null) {
  if (token) {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
  } else {
    localStorage.removeItem(AUTH_TOKEN_KEY);
  }
}

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(loadToken());
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const storedUser = loadUser();
    const storedToken = loadToken();

    if (storedToken && !storedUser) {
      fetchAuthenticatedUser(storedToken)
        .then((result) => {
          setUser(result.user);
          saveUser(result.user);
        })
        .catch(() => {
          saveToken(null);
          saveUser(null);
        })
        .finally(() => setHydrated(true));
    } else {
      setUser(storedUser);
      setHydrated(true);
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const result = await loginUser(email, password);
    setUser(result.user);
    setToken(result.token);
    saveUser(result.user);
    saveToken(result.token);
  }, []);

  const signup = useCallback(async (name: string, email: string, password: string) => {
    const result = await signupUser(name, email, password);
    setUser(result.user);
    setToken(result.token);
    saveUser(result.user);
    saveToken(result.token);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    saveUser(null);
    saveToken(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isAuthenticated: !!user,
      login,
      signup,
      logout,
    }),
    [user, token, login, signup, logout]
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
