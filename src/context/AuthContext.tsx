"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { authService } from "@/services/auth";
import type { User, LoginDto, RegisterDto } from "@/types";

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (data: LoginDto) => Promise<void>;
  register: (data: RegisterDto) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      authService
        .getProfile(storedToken)
        .then((userData) => {
          setUser(userData);
          setToken(storedToken);
        })
        .catch(() => {
          localStorage.removeItem("token");
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
  };

  const register = async (data: RegisterDto) => {
    const user = await authService.register(data);
    const loginResponse = await authService.login({
      email: data.email,
      password: data.password,
    });
    setUser(loginResponse.user);
    setToken(loginResponse.access_token);
    localStorage.setItem("token", loginResponse.access_token);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
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
