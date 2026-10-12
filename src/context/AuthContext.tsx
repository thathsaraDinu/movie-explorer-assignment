import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type AuthContextValue = {
  isAuthenticated: boolean;
  login: (username: string, password: string) => boolean;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const DEMO_USERNAME = "demo";
const DEMO_PASSWORD = "movie123";
const AUTH_STORAGE_KEY = "movieExplorerAuthenticated";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => localStorage.getItem(AUTH_STORAGE_KEY) === "true",
  );

  useEffect(() => {
    if (isAuthenticated) {
      localStorage.setItem(AUTH_STORAGE_KEY, "true");
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  }, [isAuthenticated]);

  function login(username: string, password: string) {
    const valid =
      username.trim() === DEMO_USERNAME && password === DEMO_PASSWORD;

    if (valid) setIsAuthenticated(true);
    return valid;
  }

  function logout() {
    setIsAuthenticated(false);
  }

  const value = useMemo(
    () => ({ isAuthenticated, login, logout }),
    [isAuthenticated],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
