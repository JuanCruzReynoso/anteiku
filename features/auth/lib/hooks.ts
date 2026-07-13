"use client";

import { useSession } from "next-auth/react";

export function useAuth() {
  const { data: session, status, update } = useSession();

  return {
    user: session?.user,
    session,
    loading: status === "loading",
    authenticated: status === "authenticated",
  };
}
