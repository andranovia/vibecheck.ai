"use client";

import { create } from "zustand";
import { useEffect } from "react";
import { useSession } from "next-auth/react";

interface AuthState {
  status: "loading" | "unauthenticated" | "authenticated";
  user: { id: string; name?: string | null; email?: string | null; image?: string | null; role: "ADMIN" | "PREMIUM" | "USER" } | null;
}

export const useAuthStore = create<AuthState>(() => ({ status: "loading", user: null }));

export function useAuth() {
  const { data, status } = useSession();
  const set = useAuthStore.setState;

  useEffect(() => {
    const u = data?.user as any;
    set({
      status: status as AuthState["status"],
      user: u
        ? { id: u.id, name: u.name, email: u.email, image: u.image, role: u.role }
        : null,
    });
  }, [data, status, set]);

  return useAuthStore();
}
