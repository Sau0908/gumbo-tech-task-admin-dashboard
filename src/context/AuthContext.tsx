import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { authService } from "../services/authService";
import type { User } from "../types";

interface AuthContextValue {
  user: User | null;
  isChecking: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isChecking, setIsChecking] = useState(true);
  const logout = useCallback(() => {
    localStorage.removeItem("admin_token");
    setUser(null);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (!token) {
      setIsChecking(false);
      return;
    }
    authService
      .getMe()
      .then((current) => {
        if (current.role !== "admin") throw new Error("Admin access required");
        setUser(current);
      })
      .catch(logout)
      .finally(() => setIsChecking(false));
  }, [logout]);

  useEffect(() => {
    window.addEventListener("auth:expired", logout);
    return () => window.removeEventListener("auth:expired", logout);
  }, [logout]);

  const login = async (email: string, password: string) => {
    const result = await authService.adminLogin(email, password);
    localStorage.setItem("admin_token", result.token);
    setUser(result.user);
  };

  const register = async (name: string, email: string, password: string) => {
    const result = await authService.registerAdmin(name, email, password);
    localStorage.setItem("admin_token", result.token);
    setUser(result.user);
  };

  return (
    <AuthContext.Provider value={{ user, isChecking, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
