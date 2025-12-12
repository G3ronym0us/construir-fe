"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { authService } from "@/services/auth";
import type { User, LoginDto, RegisterDto, UserRole } from "@/types";
import type { Permission } from "@/lib/permissions";
import { hasPermission as checkPermission, isAdmin as checkIsAdmin } from "@/lib/permissions";

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  userRole: UserRole | null;
  hasPermission: (permission: Permission) => boolean;
  isAdmin: boolean;
  login: (data: LoginDto) => Promise<void>;
  register: (data: RegisterDto) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Computed values based on user role
  const userRole = user?.role ?? null;
  const isAdmin = checkIsAdmin(userRole);

  const hasPermission = useCallback(
    (permission: Permission) => {
      return checkPermission(userRole, permission);
    },
    [userRole]
  );

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      authService
        .getProfile()
        .then((userData) => {
          setUser(userData);
          setToken(storedToken);
          // Also save user data to localStorage for admin panel
          localStorage.setItem("user", JSON.stringify(userData));
        })
        .catch(() => {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (data: LoginDto) => {
    const response = await authService.login(data);
    setUser(response.user);
    setToken(response.access_token);
    localStorage.setItem("token", response.access_token);
    localStorage.setItem("user", JSON.stringify(response.user));
  };

  const register = async (data: RegisterDto) => {
    // First register the user
    await authService.register(data);
    // Then login with the same credentials
    const loginResponse = await authService.login({
      email: data.email,
      password: data.password,
    });
    setUser(loginResponse.user);
    setToken(loginResponse.access_token);
    localStorage.setItem("token", loginResponse.access_token);
    localStorage.setItem("user", JSON.stringify(loginResponse.user));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        userRole,
        hasPermission,
        isAdmin,
        login,
        register,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
