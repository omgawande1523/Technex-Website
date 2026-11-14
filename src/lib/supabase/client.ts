import { createBrowserClient } from "@supabase/ssr";

type SupabaseBrowserClient = ReturnType<typeof createBrowserClient>;

let client: SupabaseBrowserClient | null = null;

function getClient(): SupabaseBrowserClient {
  if (!client) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) {
      throw new Error(
        "Supabase is not configured: set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
      );
    }
    client = createBrowserClient(url, key);
  }
  return client;
}

// Created lazily on first use so builds succeed without Supabase env vars.
export const supabase = new Proxy({} as SupabaseBrowserClient, {
  get(_target, prop) {
    const c = getClient();
    const value = Reflect.get(c, prop, c);
    return typeof value === "function" ? value.bind(c) : value;
  },
});
