import React, { createContext, useContext, useMemo, useState } from "react";
import { apiFetch } from "../api/client";
import type { AuthResponse, User } from "../api/types";

const STORAGE_KEY = "facturechain.auth";

type AuthContextValue = {
  token: string | null;
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: { email: string; password: string; companyName?: string; siret?: string; address?: string }) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function loadStoredAuth() {
  if (typeof window === "undefined") {
    return { token: null, user: null };
  }
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return { token: null, user: null };
  try {
    const parsed = JSON.parse(raw);
    return { token: parsed.token || null, user: parsed.user || null };
  } catch {
    return { token: null, user: null };
  }
}

function storeAuth(token: string, user: User) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ token, user }));
}

function clearAuth() {
  localStorage.removeItem(STORAGE_KEY);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const initial = loadStoredAuth();
  const [token, setToken] = useState<string | null>(initial.token);
  const [user, setUser] = useState<User | null>(initial.user);
  const [loading, setLoading] = useState(false);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const data = await apiFetch<AuthResponse>("/api/auth/login", {
        method: "POST",
        body: { email, password }
      });
      setToken(data.token);
      setUser(data.user);
      storeAuth(data.token, data.user);
    } finally {
      setLoading(false);
    }
  };

  const register = async (payload: { email: string; password: string; companyName?: string; siret?: string; address?: string }) => {
    setLoading(true);
    try {
      const data = await apiFetch<AuthResponse>("/api/auth/register", {
        method: "POST",
        body: payload
      });
      setToken(data.token);
      setUser(data.user);
      storeAuth(data.token, data.user);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    clearAuth();
  };

  const value = useMemo(
    () => ({ token, user, loading, login, register, logout }),
    [token, user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
