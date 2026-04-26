"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export type AdminAuthState = "loading" | "authenticated" | "unauthenticated";

export function useAdminAuth() {
  const [state, setState] = useState<AdminAuthState>("loading");
  const [token, setToken] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const router = useRouter();
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  const checkAuth = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      if (mountedRef.current) { setState("unauthenticated"); setToken(null); setEmail(null); }
      return;
    }

    // Verify with server that this user is the admin
    const res = await fetch("/api/admin/auth", {
      headers: { Authorization: `Bearer ${session.access_token}` },
    });

    if (!mountedRef.current) return;
    if (res.ok) {
      const data = await res.json();
      setState("authenticated");
      setToken(session.access_token);
      setEmail(data.email);
    } else {
      setState("unauthenticated");
      setToken(null);
      setEmail(null);
    }
  }, []);

  useEffect(() => {
    checkAuth();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        if (mountedRef.current) { setState("unauthenticated"); setToken(null); setEmail(null); }
      } else {
        checkAuth();
      }
    });
    return () => subscription.unsubscribe();
  }, [checkAuth]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    router.push("/admin");
  }, [router]);

  /** Authenticated fetch helper — attaches the JWT automatically. */
  const adminFetch = useCallback(async (url: string, options: RequestInit = {}) => {
    const { data: { session } } = await supabase.auth.getSession();
    const currentToken = session?.access_token ?? token;
    return fetch(url, {
      ...options,
      headers: {
        ...(options.headers as Record<string, string>),
        Authorization: `Bearer ${currentToken}`,
        ...(options.body && !(options.body instanceof FormData)
          ? { "Content-Type": "application/json" }
          : {}),
      },
    });
  }, [token]);

  return { state, token, email, signOut, adminFetch };
}
