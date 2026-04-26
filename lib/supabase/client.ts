import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

// Defer createClient until env vars are confirmed non-empty.
// During SSR of "use client" components the module is imported but supabase
// methods are only called inside useEffect (client-only), so the Proxy is
// never invoked on the server and never throws.
export const supabase: SupabaseClient = url && key
  ? createClient(url, key)
  : new Proxy({} as SupabaseClient, {
      get(_t, prop) {
        throw new Error(
          `Supabase not configured: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be set (tried to access .${String(prop)})`
        );
      },
    });
