"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  authApi,
  authStorage,
  UserProfile,
  AuthResponse,
  ApiError,
} from "./api";

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  login: (payload: { email: string; password: string }) => Promise<AuthResponse>;
  register: (payload: {
    email: string;
    password: string;
    full_name: string;
    role?: string;
  }) => Promise<UserProfile>;
  logout: () => void;
  refreshUser: () => Promise<UserProfile | null>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const initAuth = useCallback(async () => {
    try {
      const storedToken = authStorage.getToken();
      const storedUser = authStorage.getUser();

      if (storedToken) {
        setToken(storedToken);
        if (storedUser) {
          setUser(storedUser);
        }
        try {
          const freshUser = await authApi.getMe();
          setUser(freshUser);
        } catch (err) {
          // Token expired or invalid
          authStorage.removeToken();
          setToken(null);
          setUser(null);
        }
      }
    } catch (err) {
      console.error("Failed to initialize authentication:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  const login = async (payload: { email: string; password: string }): Promise<AuthResponse> => {
    setError(null);
    try {
      const res = await authApi.login(payload);
      setToken(res.access_token);
      setUser(res.user);
      return res;
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Failed to sign in. Please verify your credentials.";
      setError(msg);
      throw err;
    }
  };

  const register = async (payload: {
    email: string;
    password: string;
    full_name: string;
    role?: string;
  }): Promise<UserProfile> => {
    setError(null);
    try {
      const newUser = await authApi.register(payload);
      return newUser;
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Failed to create account. Please try again.";
      setError(msg);
      throw err;
    }
  };

  const logout = useCallback(() => {
    authApi.logout();
    setToken(null);
    setUser(null);
    router.push("/login");
  }, [router]);

  const refreshUser = async (): Promise<UserProfile | null> => {
    try {
      const fresh = await authApi.getMe();
      setUser(fresh);
      return fresh;
    } catch (err) {
      console.warn("Could not refresh user profile:", err);
      return null;
    }
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        error,
        login,
        register,
        logout,
        refreshUser,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
