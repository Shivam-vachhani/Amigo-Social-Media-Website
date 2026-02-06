"use client";
import { fetchMe } from "@/lib/auth";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useContext, createContext } from "react";
export interface User {
  userId: string;
  email: string;
  name: string;
  avatarUrl: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  refetchUser: () => void;
}

export const AuthContex = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const {
    data: user,
    isLoading,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["me"],
    queryFn: fetchMe,
  });

  const isLodingAuth = isLoading || isFetching;

  return (
    <AuthContex.Provider
      value={{
        user: user ?? null,
        isAuthenticated: !!user,
        isLoading: isLodingAuth,
        refetchUser: refetch,
      }}
    >
      {children}
    </AuthContex.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContex);
  if (!ctx) throw new Error("useAuth Must be used inside AuthProvider");
  return ctx;
};
